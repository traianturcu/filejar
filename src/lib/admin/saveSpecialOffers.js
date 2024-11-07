import { createClient } from "@supabase/supabase-js";

export const saveSpecialOffers = async (shop, offers) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase.from("shop").update({ offers }).eq("id", shop);

  if (error) {
    throw new Error(error.message);
  }
};
