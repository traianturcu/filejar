import { getShop } from "@/lib/shop";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop, order_id } = JSON.parse(Message);
    if (!shop || !order_id) {
      throw new Error("Shop or order_id not found");
    }

    const shop_data = await getShop(shop);
    const access_token = shop_data?.access_token;
    if (!access_token) {
      throw new Error("Access token is missing");
    }

    // get order from supabase
    const { data: order } = await supabase.from("order").select("*").eq("order_id", order_id).eq("shop", shop).single();

    if (!order) {
      throw new Error("Order not found");
    }

    const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

    const fulfillmentOrderQuery = `query getFulfillmentOrder($orderId: ID!) {
      order(id: $orderId) {
        fulfillmentOrders(first: 1) {
          edges {
            node {
              id
              lineItems(first: 250) {
                edges {
                  node {
                    id
                    remainingQuantity
                    variant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    // Get the fulfillment order details first
    const fulfillmentOrderResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
      body: JSON.stringify({
        query: fulfillmentOrderQuery,
        variables: {
          orderId: `gid://shopify/Order/${order_id}`,
        },
      }),
    });

    const fulfillmentOrderData = await fulfillmentOrderResponse.json();
    const fulfillmentOrderId = fulfillmentOrderData?.data?.order?.fulfillmentOrders?.edges?.[0]?.node?.id;
    const lineItems = fulfillmentOrderData?.data?.order?.fulfillmentOrders?.edges?.[0]?.node?.lineItems?.edges?.map((item) => item.node);

    if (!fulfillmentOrderId) {
      throw new Error("Fulfillment order not found");
    }

    const fullfilable_variant_ids =
      order?.products?.filter((item) => item.fulfillable_quantity > 0)?.map((item) => `gid://shopify/ProductVariant/${item.variant_id}`) ?? [];

    if (fullfilable_variant_ids.length === 0) {
      throw new Error("No fullfilable variant ids found");
    }

    const { data: products } = await supabase
      .from("product")
      .select("variants,settings")
      .eq("shop", shop)
      .overlaps("variants", fullfilable_variant_ids)
      .filter("settings->autoFulfill", "eq", true);
    const autoFulfillVariantIds = products?.flatMap((product) => product.variants) ?? [];

    const variant_ids = fullfilable_variant_ids.filter((variant_id) => autoFulfillVariantIds.includes(variant_id));

    const fulfillable_line_items = lineItems?.filter((item) => variant_ids.includes(item.variant.id));

    if (fulfillable_line_items.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No fulfillable line items found",
        },
        { status: 200 }
      );
    }

    const query = `mutation fulfillmentCreate($fulfillment: FulfillmentInput!) {
      fulfillmentCreate(fulfillment: $fulfillment) {
        fulfillment {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`;

    const variables = {
      fulfillment: {
        lineItemsByFulfillmentOrder: [
          {
            fulfillmentOrderId,
            fulfillmentOrderLineItems: fulfillable_line_items.map((line_item) => ({
              id: line_item.id,
              quantity: line_item.remainingQuantity,
            })),
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
      body: JSON.stringify({ query, variables }),
    });
    const { data, errors } = await response.json();

    return Response.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};
