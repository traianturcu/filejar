import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getShop } from "@/lib/shop";

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
    const shop_name = shopData?.details?.name;

    const customer_email = order?.customer_email;
    const customer_first_name = order?.customer_first_name;
    const order_name = order?.order_name;
    const download_link = `${shopData?.details?.primaryDomain?.url ?? shopData?.details?.url}/apps/${process.env.APP_HANDLE}/download/${order?.id}`;

    const from_name = shop_name;
    const to = customer_email;
    const subject = `Download your content for order ${order_name}`;
    const text = `
      Hello ${customer_first_name},

      Thank you for purchasing from ${shop_name}! You can download your content for order ${order_name} using the button below.

      Download Link: ${download_link}

      Your order includes the following products:
      ${products?.map((product) => `${product?.title} (${product?.files?.length ?? 0} file${product?.files?.length !== 1 ? "s" : ""})`).join("\n")}

      Thank you,
      ${shop_name} Team

      If you have any questions, please contact us at ${shopData?.details?.email}

      Powered by ${process.env.APP_NAME}
      `;
    const html = `
      <div style="max-width: 600px; margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:16px;">
        <table style="width: 100%;border:none;margin-bottom:20px;font-size:18px;font-weight:600;">
          <tr>
            <td>${shop_name}</td>
            <td align="right">${order_name}</td>
          </tr>
        </table>
        <p>Hello ${customer_first_name},</p>
        <p>Thank you for purchasing from <b>${shop_name}</b>! You can download your content for <b>order ${order_name}</b> using the button below.</p>
        <div style="text-align: center;">
          <a href="${download_link}" style="display: inline-block; padding: 10px 20px; font-size: 20px; font-weight: 600; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px;">Download Content</a>
        </div>
        <p>Your order includes the following products:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom:40px; margin-top:20px;">
          ${products
            ?.map(
              (product) => `<tr>
            <td style="width:50px; padding: 10px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;"><img width="50" height="50" src="${
              product?.image ??
              "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+Cjxzdmcgd2lkdGg9IjgwMHB4IiBoZWlnaHQ9IjgwMHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggZD0ibSA0IDEgYyAtMS42NDQ1MzEgMCAtMyAxLjM1NTQ2OSAtMyAzIHYgMSBoIDEgdiAtMSBjIDAgLTEuMTA5Mzc1IDAuODkwNjI1IC0yIDIgLTIgaCAxIHYgLTEgeiBtIDIgMCB2IDEgaCA0IHYgLTEgeiBtIDUgMCB2IDEgaCAxIGMgMS4xMDkzNzUgMCAyIDAuODkwNjI1IDIgMiB2IDEgaCAxIHYgLTEgYyAwIC0xLjY0NDUzMSAtMS4zNTU0NjkgLTMgLTMgLTMgeiBtIC01IDQgYyAtMC41NTA3ODEgMCAtMSAwLjQ0OTIxOSAtMSAxIHMgMC40NDkyMTkgMSAxIDEgcyAxIC0wLjQ0OTIxOSAxIC0xIHMgLTAuNDQ5MjE5IC0xIC0xIC0xIHogbSAtNSAxIHYgNCBoIDEgdiAtNCB6IG0gMTMgMCB2IDQgaCAxIHYgLTQgeiBtIC00LjUgMiBsIC0yIDIgbCAtMS41IC0xIGwgLTIgMiB2IDAuNSBjIDAgMC41IDAuNSAwLjUgMC41IDAuNSBoIDcgcyAwLjQ3MjY1NiAtMC4wMzUxNTYgMC41IC0wLjUgdiAtMSB6IG0gLTguNSAzIHYgMSBjIDAgMS42NDQ1MzEgMS4zNTU0NjkgMyAzIDMgaCAxIHYgLTEgaCAtMSBjIC0xLjEwOTM3NSAwIC0yIC0wLjg5MDYyNSAtMiAtMiB2IC0xIHogbSAxMyAwIHYgMSBjIDAgMS4xMDkzNzUgLTAuODkwNjI1IDIgLTIgMiBoIC0xIHYgMSBoIDEgYyAxLjY0NDUzMSAwIDMgLTEuMzU1NDY5IDMgLTMgdiAtMSB6IG0gLTggMyB2IDEgaCA0IHYgLTEgeiBtIDAgMCIgZmlsbD0iIzJlMzQzNCIgZmlsbC1vcGFjaXR5PSIwLjM0OTAyIi8+DQo8L3N2Zz4="
            }" style="width: 50px; height: 50px; object-fit: cover;border-radius:8px;" /></td>
            <td style="padding: 10px; font-size:17px; font-weight:600; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;">${product?.title}</td>
            <td style="padding: 10px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; text-align: right;">${product?.files?.length ?? 0} file${
                product?.files?.length !== 1 ? "s" : ""
              }</td>
          </tr>`
            )
            .join("")}
        </table>
        <p>Thank you,<br>${shop_name} Team</p>
        <hr style="border: 1px solid #ccc; margin: 50px 0 20px 0;" />
        <p>If you have any questions, please contact us at <a style="color: #007bff; text-decoration: none; font-weight: 600;" href="mailto:${
          shopData?.details?.email
        }">${shopData?.details?.email}</a></p>
        <br/><br/>
        <p style="text-align: center; font-size: 12px; color: #666;">Powered by <a style="color: #007bff; text-decoration: none; font-weight: 600;" href="https://filejar.com">${
          process.env.APP_NAME
        }</a></p>
      </div>
      `;

    await sendEmail({ to, from_name, subject, html, text });

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