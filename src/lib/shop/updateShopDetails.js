import { createClient } from "@supabase/supabase-js";
import { requestShopDetails } from "@/lib/shopify";

export const updateShopDetails = async (shop, access_token) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const details = await requestShopDetails(shop, access_token);

    if (!details) {
      throw new Error("Failed to obtain shop details from Shopify API");
    }

    const { error } = await supabase.from("shop").upsert({ id: shop, details }, { onConflict: ["id"] });

    if (error) {
      throw new Error("Error upserting shop details: " + error.message);
    }

    return true;
  } catch (error) {
    console.error({
      error,
      shop,
      access_token,
      message: "Error in verifyShopDetails",
    });
    return false;
  }
};
