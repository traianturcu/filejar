import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getShop } from "@/lib/shop";
import { email_template_defaults, replaceVariables } from "@/constants/emailTemplateDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const id = request?.nextUrl?.searchParams?.get("id");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { data: order } = await supabase.from("order").select("*").eq("order_id", id).eq("shop", shop).single();

    if (!order) {
      throw new Error("Order not found");
    }

    const events = order?.events ?? [];

    events.push({
      action: "Email resent",
      created_at: new Date().toISOString(),
    });

    await supabase.from("order").update({ events }).eq("order_id", id).eq("shop", shop);

    const variant_ids = order?.products?.map((item) => `gid://shopify/ProductVariant/${item?.variant_id}`);

    const { data: products } = await supabase.from("product").select("*").eq("shop", shop).overlaps("variants", variant_ids);

    const shopData = await getShop(shop);

    const emailTemplateSettings = shopData?.settings?.email_template;

    const customer_email = order?.customer_email;
    const order_name = order?.order_name;
    const download_link = `${shopData?.details?.primaryDomain?.url ?? shopData?.details?.url}/apps/${process.env.APP_HANDLE}/download/${order?.id}`;

    const from_name = shopData?.sender_name ?? shopData?.name;
    const from_email = shopData?.sender_verified ? shopData?.sender_email : null;
    const to = customer_email;
    const subject = replaceVariables(emailTemplateSettings?.subject ?? email_template_defaults.subject, shopData?.details, order);

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
            <td>${from_name}</td>
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

    await sendEmail({ to, from_name, subject, html, text, from_email });

    return Response.json(
      {
        success: true,
        events,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};
