import { createClient } from "@supabase/supabase-js";
import { usageCheckFrequency } from "@/constants/usage";

export const getShop = async (shop, forced = false) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data } = await supabase.from("shop").select().eq("id", shop).single();

    const tooOld = new Date(Date.now() - usageCheckFrequency).toISOString();
    const last_usage_check = data?.last_usage_check;
    const last_usage_check_date = last_usage_check ? last_usage_check : null;

    if (!last_usage_check || last_usage_check_date < tooOld || forced) {
      let storage_usage = data?.usage?.storage ?? 0;
      let files_usage = data?.usage?.files ?? 0;
      let orders_usage = data?.usage?.orders ?? 0;
      let products_usage = data?.usage?.products ?? 0;

      const { data: data_files, count: count_files } = await supabase
        .schema("storage")
        .from("objects")
        .select("*", { count: "exact" })
        .eq("bucket_id", "uploads")
        .eq("owner_id", data?.uuid);

      files_usage = count_files;
      storage_usage = data_files.reduce((acc, file) => acc + file?.metadata?.size ?? 0, 0);

      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: count_orders } = await supabase
        .from("order")
        .select("*", { count: "exact", head: true })
        .eq("shop", shop)
        .eq("is_digital", true)
        .gte("created_at", firstDayOfMonth);

      orders_usage = count_orders;

      const { count: count_products } = await supabase.from("product").select("*", { count: "exact", head: true }).eq("shop", shop);

      products_usage = count_products;

      data.last_usage_check = new Date().toISOString();
      data.usage = {
        storage_usage,
        files_usage,
        orders_usage,
        products_usage,
      };

      await supabase
        .from("shop")
        .update({
          usage: data.usage,
          last_usage_check: new Date().toISOString(),
        })
        .eq("id", shop);
    }

    return data;
  } catch (error) {
    console.error({
      error,
      shop,
      message: "Error in getShop",
    });
  }
};
