import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import formatFileSize from "@/lib/utils/formatFileSize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const replaceEmail = (text) => {
  const email_regex = /\w+@\w+\.\w+/g;
  text = text.replace(email_regex, (email) => `<a class="email-link" href="mailto:${email}">${email}</a>`);
  return text;
};

export const GET = async (request, { params }) => {
  try {
    const { id } = params;
    // get all search params
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get("shop");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    // get settings
    const { data: shopData } = await supabase.from("shop").select("*").eq("id", shop).single();

    // get order from supabase
    const { data: order } = await supabase.from("order").select("*").eq("id", id).eq("shop", shop).single();

    if (!order?.order_name) {
      return new Response(
        `
        <div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">We're currently processing your order. Please check back in a minute.</div>
        `,
        {
          headers: {
            "Content-Type": "application/liquid",
          },
          status: 200,
        }
      );
    }

    const order_name = order?.order_name ?? "";
    const customer_email = order?.customer_email ?? "";
    const customer_first_name = order?.customer_first_name ?? "";
    const customer_last_name = order?.customer_last_name ?? "";
    const order_date = order?.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
    const products = order?.products ?? [];
    let access_count = order?.access_count ?? 0;

    let products_html = ``;

    // check order access
    if (order?.cancelled_at) {
      return new Response(
        `<div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">${replaceEmail(
          shopData?.settings?.order_protection?.orderCancelledMessage ??
            `This order has been cancelled and cannot be accessed. Please contact support at ${shopData?.email} for more information.`
        )}</div>`,
        {
          headers: {
            "Content-Type": "application/liquid",
          },
          status: 200,
        }
      );
    } else if (order?.access_enabled === false) {
      return new Response(
        `<div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">${replaceEmail(
          shopData?.settings?.order_protection?.manuallyRevokedMessage ??
            `Your access to this order has been revoked. Please contact support at ${shopData?.email} for more information.`
        )}</div>`,
        {
          headers: {
            "Content-Type": "application/liquid",
          },
          status: 200,
        }
      );
    } else if (order?.access_enabled !== true) {
      // fraud risk
      const fraud_risk = order?.fraud_risk;
      const risk_levels = shopData?.settings?.order_protection?.riskLevels;
      if (risk_levels?.includes(fraud_risk)) {
        return new Response(
          `<div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">${replaceEmail(
            shopData?.settings?.order_protection?.fraudRiskMessage ??
              `Your access to this order has been revoked due to fraud risk. Please contact support at ${shopData?.email} for more information.`
          )}</div>`,
          {
            headers: {
              "Content-Type": "application/liquid",
            },
            status: 200,
          }
        );
      }

      // payment status
      const payment_status = order?.payment_status;
      const payment_statuses = shopData?.settings?.order_protection?.paymentStatus;
      if (payment_statuses?.includes(payment_status)) {
        return new Response(
          `<div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">${replaceEmail(
            shopData?.settings?.order_protection?.paymentStatusMessage ??
              `You can't access this order because the payment hasn't been completed yet. Please contact support at ${shopData?.email} for more information.`
          )}</div>`,
          {
            headers: {
              "Content-Type": "application/liquid",
            },
            status: 200,
          }
        );
      }

      // time limit
      if (shopData?.settings?.order_protection?.limitTime?.[0] === "limited") {
        const time_limit = parseInt(shopData?.settings?.order_protection?.downloadDays) || 0;
        const order_date = new Date(order?.created_at);
        const current_date = new Date();
        const time_difference = Math.floor((current_date - order_date) / (1000 * 60 * 60 * 24));
        if (time_difference > time_limit) {
          return new Response(
            `<div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">${replaceEmail(
              shopData?.settings?.order_protection?.timeLimitMessage ??
                `You can't access this order because the order was placed too long ago. Please contact support at ${shopData?.email} for more information.`
            )}</div>`,
            {
              headers: {
                "Content-Type": "application/liquid",
              },
              status: 200,
            }
          );
        }
      }

      // number of access attempts
      if (shopData?.settings?.order_protection?.limitDownloads?.[0] === "limited") {
        const download_limit = parseInt(shopData?.settings?.order_protection?.downloadLimit) || 0;
        const access_count = order?.access_count ?? 0;
        if (access_count >= download_limit) {
          return new Response(
            `<div style="margin: 50px auto; width: 600px; text-align: center; font-size: 24px; font-weight: bold;">${replaceEmail(
              shopData?.settings?.order_protection?.downloadLimitMessage ??
                `You can't access this order because you've reached the maximum access limit. Please contact support at ${shopData?.email} for more information.`
            )}</div>`,
            {
              headers: {
                "Content-Type": "application/liquid",
              },
              status: 200,
            }
          );
        }
      }
    }

    for (const product of products) {
      const variant_id = `gid://shopify/ProductVariant/${product.variant_id}`;

      const { data: digital_product } = await supabase.from("product").select("*").eq("shop", shop).contains("variants", [variant_id]).single();

      if (!digital_product) {
        continue;
      }

      const image =
        digital_product?.details?.images?.[0]?.originalSrc ??
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+Cjxzdmcgd2lkdGg9IjgwMHB4IiBoZWlnaHQ9IjgwMHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggZD0ibSA0IDEgYyAtMS42NDQ1MzEgMCAtMyAxLjM1NTQ2OSAtMyAzIHYgMSBoIDEgdiAtMSBjIDAgLTEuMTA5Mzc1IDAuODkwNjI1IC0yIDIgLTIgaCAxIHYgLTEgeiBtIDIgMCB2IDEgaCA0IHYgLTEgeiBtIDUgMCB2IDEgaCAxIGMgMS4xMDkzNzUgMCAyIDAuODkwNjI1IDIgMiB2IDEgaCAxIHYgLTEgYyAwIC0xLjY0NDUzMSAtMS4zNTU0NjkgLTMgLTMgLTMgeiBtIC01IDQgYyAtMC41NTA3ODEgMCAtMSAwLjQ0OTIxOSAtMSAxIHMgMC40NDkyMTkgMSAxIDEgcyAxIC0wLjQ0OTIxOSAxIC0xIHMgLTAuNDQ5MjE5IC0xIC0xIC0xIHogbSAtNSAxIHYgNCBoIDEgdiAtNCB6IG0gMTMgMCB2IDQgaCAxIHYgLTQgeiBtIC00LjUgMiBsIC0yIDIgbCAtMS41IC0xIGwgLTIgMiB2IDAuNSBjIDAgMC41IDAuNSAwLjUgMC41IDAuNSBoIDcgcyAwLjQ3MjY1NiAtMC4wMzUxNTYgMC41IC0wLjUgdiAtMSB6IG0gLTguNSAzIHYgMSBjIDAgMS42NDQ1MzEgMS4zNTU0NjkgMyAzIDMgaCAxIHYgLTEgaCAtMSBjIC0xLjEwOTM3NSAwIC0yIC0wLjg5MDYyNSAtMiAtMiB2IC0xIHogbSAxMyAwIHYgMSBjIDAgMS4xMDkzNzUgLTAuODkwNjI1IDIgLTIgMiBoIC0xIHYgMSBoIDEgYyAxLjY0NDUzMSAwIDMgLTEuMzU1NDY5IDMgLTMgdiAtMSB6IG0gLTggMyB2IDEgaCA0IHYgLTEgeiBtIDAgMCIgZmlsbD0iIzJlMzQzNCIgZmlsbC1vcGFjaXR5PSIwLjM0OTAyIi8+DQo8L3N2Zz4=";
      const total_files = digital_product?.files?.length ?? 0;
      const file_names = digital_product?.files;

      const { data: files } = await supabase
        .schema("storage")
        .from("objects")
        .select("*", { count: "exact" })
        .eq("bucket_id", "uploads")
        .in("name", file_names);

      let files_html = ``;

      const downloads = [];
      for (const file of files) {
        const file_id = file?.id;
        const order_id = id;
        downloads.push({
          file_id,
          order_id,
          shop,
        });
      }
      const { data: downloads_data } = await supabase.from("download").insert(downloads).select();

      for (const file of files) {
        const file_name = file?.user_metadata?.originalFileName;
        const file_size = file?.metadata?.size;
        const { data: file_data } = await supabase.storage.from("uploads").createSignedUrl(file?.name, 86400, {
          download: true,
        });
        const file_id = file?.id;

        const download_id = downloads_data?.find((download) => download?.file_id === file_id)?.id;

        files_html += `
        <div class="product-file">
          <div class="product-file-details">
            <p class="product-file-name">${file_name}</p>
            <p class="product-file-size">${formatFileSize(file_size)}</p>
          </div>
          <div class="product-file-download">
            <a class="download-button" href="${`${process.env.APP_URL}/api/download/${download_id}`}">${
          shopData?.settings?.download_page_template?.button_text ?? "Download"
        }</a>
          </div>
        </div>
        `;
      }

      products_html += `
      <div class="product">
        <div class="product-header">
          <img class="product-image" src="${image}" alt="${product.name}" />
          <div class="product-details">
            <p class="product-name">${product.name}</p>
            <p class="product-files">${total_files} file${total_files !== 1 ? "s" : ""}</p>
          </div>
        </div>
        ${files_html}
      </div>
      `;
    }

    const powered_by = `
    <div class="powered-by" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span>Powered by</span>
      <img
        src="https://dheghrnohauuyjxoylpc.supabase.co/storage/v1/object/public/logo/logo.png"
        width="20px"
        height="20px"
        alt="FileJar"
      />
      <a href="https://filejar.com" target="_blank">FileJar</a>
    </div>
    `;

    const message =
      shopData?.settings?.download_page_template?.message ?? "Thank you for purchasing from our store! You can download your files using the buttons below.";
    const order_prefix = shopData?.settings?.download_page_template?.order_prefix ?? "ORDER #";

    const template = readFileSync(join(process.cwd(), "src/app/api/proxy/download/template.liquid"), "utf-8");

    const templateVariables = {
      "##app_url##": process.env.APP_URL,
      "##id##": id,
      "##order_name##": order_name,
      "##customer_email##": customer_email,
      "##customer_name##": `${customer_first_name} ${customer_last_name}`,
      "##order_date##": order_date,
      "##products##": products_html,
      "##powered_by##": shopData?.settings?.download_page_template?.show_powered_by ? powered_by : "",
      "##message##": message,
      "##order_prefix##": order_prefix,
      "##button_background_color##": shopData?.settings?.download_page_template?.button_background_color ?? "#000",
      "##button_text_color##": shopData?.settings?.download_page_template?.button_text_color ?? "#fff",
      // Add more variables as needed
    };

    const compiledTemplate = Object.entries(templateVariables).reduce((result, [placeholder, value]) => result.replace(placeholder, value), template);

    await supabase
      .from("order")
      .update({
        access_count: access_count + 1,
        access_events: [
          ...(order?.access_events ?? []),
          {
            timestamp: new Date().toISOString(),
            ip: request.headers.get("x-forwarded-for") ?? request.ip,
            user_agent: request.headers.get("user-agent"),
          },
        ],
      })
      .eq("id", id)
      .eq("shop", shop);

    return new Response(compiledTemplate, {
      headers: {
        "Content-Type": "application/liquid",
      },
      status: 200,
    });
  } catch (error) {
    console.log(error);
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
