import { createClient } from "@supabase/supabase-js";

export const getShop = async (shop) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data } = await supabase.from("shop").select().eq("id", shop).single();

    return data;
  } catch (error) {
    console.error({
      error,
      shop,
      message: "Error in getShop",
    });
  }
};
