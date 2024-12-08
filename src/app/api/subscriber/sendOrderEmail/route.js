import { getShop } from "@/lib/shop";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { publish } from "@/lib/pubsub";
import { sendEmail } from "@/lib/email";
import { email_template_defaults, replaceVariables } from "@/constants/emailTemplateDefaults";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop, order } = JSON.parse(Message);
    if (!shop || !order) {
      throw new Error("Shop or order not found");
    }

    console.log({ order });

    order.order_name = order.order_number;
    order.customer_first_name = order.customer?.first_name;
    order.customer_last_name = order.customer?.last_name;
    order.customer_email = order.customer?.email;

    // get order from supabase
    const { data: currentOrder } = await supabase.from("order").select("*").eq("order_id", order.id).eq("shop", shop).single();

    const events = currentOrder?.events ?? [];

    if (currentOrder?.initial_email_sent) {
      return Response.json({ skipped: true, reason: "email already sent" }, { status: 200 });
    }

    if (order.financial_status !== "paid") {
      return Response.json({ skipped: true, reason: "not paid" }, { status: 200 });
    }

    if (currentOrder?.risk_level === "high") {
      return Response.json({ skipped: true, reason: "high risk" }, { status: 200 });
    }

    if (!currentOrder?.is_digital) {
      return Response.json({ skipped: true, reason: "not digital" }, { status: 200 });
    }

    const email_sender = uuidv4();

    await supabase.from("order").update({ initial_email_sent: true, email_sender }).eq("order_id", order.id).eq("shop", shop);

    // passed all checks
    // wait for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // to prevent duplicate emails, check that the email_sender is this service
    const { data: email_sender_data } = await supabase.from("order").select("email_sender").eq("email_sender", email_sender).eq("shop", shop).single();
    if (!email_sender_data) {
      return Response.json({ skipped: true, reason: "email sending assigned to another service" }, { status: 200 });
    }

    events.push({
      action: "Email sent",
      created_at: new Date().toISOString(),
    });

    await supabase.from("order").update({ events }).eq("order_id", order.id).eq("shop", shop);

    const shopData = await getShop(shop);

    const emailTemplateSettings = shopData?.settings?.email_template;

    const customer_email = order?.customer?.email;
    const order_name = order?.order_number;
    const order_id = order?.id;
    const download_link = `${shopData?.details?.primaryDomain?.url ?? shopData?.details?.url}/apps/${process.env.APP_HANDLE}/download/${currentOrder?.id}`;

    const variant_ids = order?.line_items?.map((item) => `gid://shopify/ProductVariant/${item?.variant_id}`);

    const { data: products } = await supabase.from("product").select("*").eq("shop", shop).overlaps("variants", variant_ids);

    const from_name = replaceVariables(shopData?.settings?.email_template?.from_name ?? email_template_defaults.from_name, shopData?.details, order, false);
    const to = customer_email;
    const subject = replaceVariables(shopData?.settings?.email_template?.subject ?? email_template_defaults.subject, shopData?.details, order);

    const text = `
      ${replaceVariables(emailTemplateSettings?.greeting ?? email_template_defaults.greeting, shopData?.details, order, false)}

      ${replaceVariables(emailTemplateSettings?.body ?? email_template_defaults.body, shopData?.details, order, false)}

      ${replaceVariables(emailTemplateSettings?.button_text ?? email_template_defaults.button_text, shopData?.details, order, false)}: ${download_link}

      ${replaceVariables(emailTemplateSettings?.product_list_header ?? email_template_defaults.product_list_header, shopData?.details, order, false)}
      ${products
        ?.map(
          (product) =>
            `${product?.title} (${product?.files?.length ?? 0} ${replaceVariables(
              emailTemplateSettings?.files_suffix ?? email_template_defaults.files_suffix,
              shopData?.details,
              order,
              false
            )})`
        )
        .join("\n")}

      ${replaceVariables(emailTemplateSettings?.thank_you_text ?? email_template_defaults.thank_you_text, shopData?.details, order, false)}
      ${replaceVariables(emailTemplateSettings?.thank_you_signature ?? email_template_defaults.thank_you_signature, shopData?.details, order, false)}

      ${replaceVariables(emailTemplateSettings?.footer ?? email_template_defaults.footer, shopData?.details, order, false)}

      ${emailTemplateSettings?.show_powered_by !== false ? `Powered by ${process.env.APP_NAME}` : ""}
      `;

    const html = `
      <div style="max-width: 600px; margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;">
        ${
          emailTemplateSettings?.logo_link
            ? `<img src="${emailTemplateSettings?.logo_link}" alt="logo" width="${
                emailTemplateSettings?.logo_size ?? "100%"
              }" style="display: block; margin: 20px auto 20px auto;" />`
            : ""
        }
        <table style="width: 100%;border:none;margin-bottom:20px;font-size:18px;font-weight:600;">
          <tr>
            <td>${replaceVariables(emailTemplateSettings?.from_name ?? email_template_defaults.from_name, shopData?.details, order, false)}</td>
            <td align="right">#${order_name}</td>
          </tr>
        </table>
        <p>${replaceVariables(emailTemplateSettings?.greeting ?? email_template_defaults.greeting, shopData?.details, order)}</p>
        <p>${replaceVariables(emailTemplateSettings?.body ?? email_template_defaults.body, shopData?.details, order)}</p>
        <div style="text-align: center;">
          <a href="${download_link}" style="display: inline-block; padding: 10px 20px; font-size: 20px; font-weight: 600; background-color: ${
      emailTemplateSettings?.button_background_color ?? email_template_defaults.button_background_color
    }; color: ${
      emailTemplateSettings?.button_text_color ?? email_template_defaults.button_text_color
    }; text-decoration: none; border-radius: 5px; margin: 20px;">${replaceVariables(
      emailTemplateSettings?.button_text ?? email_template_defaults.button_text,
      shopData?.details,
      order
    )}</a>
        </div>
        <p>${replaceVariables(emailTemplateSettings?.product_list_header ?? email_template_defaults.product_list_header, shopData?.details, order)}</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom:40px; margin-top:20px;">
          ${products
            ?.map(
              (product) => `<tr>
            <td style="width:50px; padding: 10px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;"><img width="50" height="50" src="${
              product?.image ?? "https://dheghrnohauuyjxoylpc.supabase.co/storage/v1/render/image/public/logo/ee43414f-ff6d-436d-abe4-ec015056a304.png"
            }" style="width: 50px; height: 50px; object-fit: cover;border-radius:8px;" /></td>
            <td style="padding: 10px; font-size:17px; font-weight:600; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;">${product?.title}</td>
            <td style="padding: 10px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; text-align: right;">${
              product?.files?.length ?? 0
            } ${replaceVariables(emailTemplateSettings?.files_suffix ?? email_template_defaults.files_suffix, shopData?.details, order, false)}</td>
          </tr>`
            )
            .join("")}
        </table>
        <p>${replaceVariables(emailTemplateSettings?.thank_you_text ?? email_template_defaults.thank_you_text, shopData?.details, order)}<br>${replaceVariables(
      emailTemplateSettings?.thank_you_signature ?? email_template_defaults.thank_you_signature,
      shopData?.details,
      order
    )}</p>
        <hr style="border: 1px solid #ccc; margin: 50px 0 20px 0;" />
        <p>${replaceVariables(emailTemplateSettings?.footer ?? email_template_defaults.footer, shopData?.details, order)}</p>
        ${
          emailTemplateSettings?.show_powered_by !== false
            ? `<br/><br/>
            <p style="text-align: center; font-size: 12px; color: #666;">Powered by <a style="color: #007bff; text-decoration: none; font-weight: 600;" href="https://filejar.com">${process.env.APP_NAME}</a></p>`
            : ""
        }
      </div>
      `;

    await sendEmail({ to, from_name, subject, html, text });

    // fulfill items
    await publish("FULFILL_ITEMS", {
      order_id,
      shop,
    });

    return Response.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling orderPaidToDB", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};
