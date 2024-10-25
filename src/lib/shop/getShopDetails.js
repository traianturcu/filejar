import { createClient } from "@supabase/supabase-js";

export const getShopDetails = async (shop) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data } = await supabase.from("shop").select("details").eq("id", shop).single();

    if (data?.details) {
      return data.details;
    } else {
      return null;
    }
  } catch (error) {
    console.error({
      error,
      shop,
      sessionToken,
      message: "Error in getShopDetails",
    });
  }
};
