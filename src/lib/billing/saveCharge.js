import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const saveCharge = async (shop, plan, charge) => {
  try {
    const { error } = await supabase.from("charge").insert({ shop, plan, id: charge });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error({
      message: "Error: Failed to add charge to database",
      error,
      shop,
      plan,
      charge,
    });
    return false;
  }
};
