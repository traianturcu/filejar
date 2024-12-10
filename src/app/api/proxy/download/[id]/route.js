import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import formatFileSize from "@/lib/utils/formatFileSize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request, { params }) => {
  try {
    const { id } = params;
    // get all search params
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get("shop");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

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

    let products_html = ``;

    if (order?.fraud_risk === "high") {
      return new Response(
        `<div style="text-align: center; font-size: 24px; font-weight: bold; margin: 40px;">This order has been marked as high risk and cannot be accessed.<br /> For further details, please contact us.</div>`,
        {
          headers: {
            "Content-Type": "application/liquid",
          },
          status: 200,
        }
      );
    }

    if (order?.cancelled_at) {
      return new Response(
        `<div style="text-align: center; font-size: 24px; font-weight: bold; margin: 40px;">This order has been cancelled and cannot be accessed.<br /> For further details, please contact us.</div>`,
        {
          headers: {
            "Content-Type": "application/liquid",
          },
          status: 200,
        }
      );
    }

    if (order?.access_revoked) {
      return new Response(
        `<div style="text-align: center; font-size: 24px; font-weight: bold; margin: 40px;">Your access to this order has been revoked.<br /> For further details, please contact us.</div>`,
        {
          headers: {
            "Content-Type": "application/liquid",
          },
          status: 200,
        }
      );
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

      for (const file of files) {
        const file_name = file?.user_metadata?.originalFileName;
        const file_size = file?.metadata?.size;
        const { data: file_data } = await supabase.storage.from("uploads").createSignedUrl(file?.name, 86400, {
          download: true,
        });

        files_html += `
        <div class="product-file">
          <div class="product-file-details">
            <p class="product-file-name">${file_name}</p>
            <p class="product-file-size">${formatFileSize(file_size)}</p>
          </div>
          <div class="product-file-download">
            <a class="download-button" href="${`${file_data.signedUrl}${encodeURIComponent(file_name)}`}">Download</a>
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

    const template = readFileSync(join(process.cwd(), "src/app/api/proxy/download/template.liquid"), "utf-8");

    const templateVariables = {
      "##app_url##": process.env.APP_URL,
      "##id##": id,
      "##order_name##": order_name,
      "##customer_email##": customer_email,
      "##customer_name##": `${customer_first_name} ${customer_last_name}`,
      "##order_date##": order_date,
      "##products##": products_html,
      // Add more variables as needed
    };

    const compiledTemplate = Object.entries(templateVariables).reduce((result, [placeholder, value]) => result.replace(placeholder, value), template);

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
