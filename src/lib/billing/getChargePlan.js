import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const getChargePlan = async (shop, chargeId) => {
  try {
    const { data, error } = await supabase.from("charge").select("plan").eq("id", chargeId).eq("shop", shop).single();

    if (error) {
      throw new Error(error.message);
    }

    return data?.plan ?? null;
  } catch (error) {
    console.error({
      shop,
      chargeId,
      error,
      message: "Error getting charge plan",
    });
    return null;
  }
};
