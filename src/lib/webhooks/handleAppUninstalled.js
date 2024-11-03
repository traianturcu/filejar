import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handleAppUninstalled = async (shop) => {
  console.log("App uninstalled", {
    shop,
  });

  try {
    const { error } = await supabase.from("shop").update({ access_token: null, installed: false }).eq("id", shop);
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error({
      message: "Error handling app uninstalled.",
      error,
      shop,
    });
  }
};
