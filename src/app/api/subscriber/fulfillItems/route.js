import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop, order_id } = JSON.parse(Message);
    if (!shop || !order_id) {
      throw new Error("Shop or order_id not found");
    }

    // get order from supabase
    const { data: order } = await supabase.from("order").select("*").eq("order_id", order_id).eq("shop", shop).single();

    if (!order) {
      throw new Error("Order not found");
    }

    const fullfilable_variant_ids = order?.line_items
      ?.filter((item) => item.fulfillable_quantity > 0)
      .map((item) => `gid://shopify/ProductVariant/${item.variant_id}`);

    const { data: products } = await supabase
      .from("product")
      .select("variants,settings")
      .eq("shop", shop)
      .overlaps("variants", fullfilable_variant_ids)
      .filter("settings->autoFulfill", "eq", true);
    const autoFulfillVariantIds = products?.flatMap((product) => product.variants) ?? [];

    const variant_ids = fullfilable_variant_ids.filter((variant_id) => autoFulfillVariantIds.includes(variant_id));

    console.log({ variant_ids });

    return Response.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling fulfillItems", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};
