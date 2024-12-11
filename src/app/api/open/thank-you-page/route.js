import { createClient } from "@supabase/supabase-js";
import { getShop } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const GET = async (request) => {
  try {
    const shop = request?.nextUrl?.searchParams?.get("shop");
    const order = request?.nextUrl?.searchParams?.get("order");
    const token = request?.nextUrl?.searchParams?.get("token"); // not used for now
    const isEditor = request?.nextUrl?.searchParams?.get("isEditor") === "true";

    const shopData = await getShop(shop);
    const accessToken = shopData?.access_token;
    if (!accessToken) {
      throw new Error("Error: Access token is missing");
    }

    // does shop's active billing plan include thank you page extension
    if (shopData?.billing_plan === "free") {
      if (isEditor) {
        return Response.json(
          {
            success: true,
            headline: "Please upgrade to a paid plan",
            body: "This store is not on a paid plan. Please upgrade to a paid plan to use this extension.",
            buttonText: "Access downloads",
            url: "#",
            showPoweredBy: false,
          },
          {
            status: 200,
          }
        );
      }
      return Response.json(
        {
          success: false,
          message: "The store is not on a paid plan.",
        },
        {
          status: 200,
        }
      );
    }

    // is the extension enabled - do not check this for now - if the merchant has enabled the extension in the theme editor, that is enough
    // if (shopData?.settings?.thank_you_page?.enabled !== true) {
    //   if (isEditor) {
    //     return Response.json(
    //       {
    //         success: true,
    //         headline: "Please enable the extension",
    //         body: "The extension is not enabled. Please enable it to display the thank you page.",
    //         buttonText: "Access downloads",
    //         url: "#",
    //         showPoweredBy: false,
    //       },
    //       {
    //         status: 200,
    //       }
    //     );
    //   }
    //   return Response.json(
    //     {
    //       success: false,
    //       message: "The extension is not enabled.",
    //     },
    //     {
    //       status: 200,
    //     }
    //   );
    // }

    // does the order contain digital products
    const graphqlUrl = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
    const orderQuery = `query getOrder($orderId: ID!) {
      order(id: $orderId) {
        lineItems(first: 250) {
          edges {
            node {
              id
              variant {
                id
              }
            }
          }
        }
      }
    }`;
    const orderResponse = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: orderQuery,
        variables: {
          orderId: `gid://shopify/Order/${order}`,
        },
      }),
    });

    const shopifyOrderData = await orderResponse.json();
    const lineItems = shopifyOrderData?.data?.order?.lineItems?.edges?.map((item) => item.node);
    const variant_ids = lineItems?.map((item) => item.variant.id) ?? [];

    const { count } = await supabase.from("product").select("*", { count: "exact", head: true }).eq("shop", shop).overlaps("variants", variant_ids);

    const is_digital = count > 0;

    if (!is_digital && !isEditor) {
      return Response.json(
        {
          success: false,
          message: "This order does not contain any digital products.",
        },
        {
          status: 200,
        }
      );
    }

    const headline = shopData?.settings?.thank_you_page?.headline;
    const body = shopData?.settings?.thank_you_page?.body;
    const buttonText = shopData?.settings?.thank_you_page?.button_text;
    const showPoweredBy = false; // always false for now, because the extension is only available on paid plans

    if (isEditor) {
      return Response.json(
        {
          success: true,
          headline,
          body,
          buttonText,
          url: "#",
          showPoweredBy,
        },
        {
          status: 200,
        }
      );
    }

    const { data: orderData } = await supabase.from("order").select("*").eq("shop", shop).eq("order_id", order).single();

    let newOrderData;
    if (!orderData) {
      const { data } = await supabase.from("order").insert({
        shop,
        order_id: order,
      });

      newOrderData = data;
    }

    const url = `${shopData?.details?.primaryDomain?.url ?? shopData?.details?.url}/apps/${process.env.APP_HANDLE}/download/${
      orderData?.id ?? newOrderData?.id
    }`;

    return Response.json(
      {
        success: true,
        headline,
        body,
        buttonText,
        url,
        showPoweredBy,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
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
