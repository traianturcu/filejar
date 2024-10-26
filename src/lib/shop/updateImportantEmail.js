import { createClient } from "@supabase/supabase-js";

export const updateImportantEmail = async (shop, email) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase.from("shop").update({ email_important: email }).eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error({
      error,
      shop,
      email,
      message: "Error in updateImportantEmail",
    });
    return false;
  }
};
