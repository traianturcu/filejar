import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const updateIsDigital = async (shop, order) => {
  const fullfilable_variant_ids = order?.line_items
    ?.filter((item) => item.fulfillable_quantity > 0)
    .map((item) => `gid://shopify/ProductVariant/${item.variant_id}`);

  const { count } = await supabase.from("product").select("*", { count: "exact", head: true }).eq("shop", shop).overlaps("variants", fullfilable_variant_ids);

  const { data: currentOrder } = await supabase.from("order").select("is_digital").eq("order_id", order.id).eq("shop", shop).single();
  const currentIsDigital = currentOrder?.is_digital;

  console.log("updateIsDigital", { count, currentIsDigital });

  if (count > 0 && !currentIsDigital) {
    await supabase.from("order").update({ is_digital: true }).eq("order_id", order.id).eq("shop", shop);
    // send email
    await publish("SEND_ORDER_EMAIL", {
      shop,
      order,
    });
  }
};

export default updateIsDigital;
