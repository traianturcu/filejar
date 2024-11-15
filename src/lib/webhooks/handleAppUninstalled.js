import { createClient } from "@supabase/supabase-js";
import { updateBillingPlan } from "@/lib/billing";
import { publish } from "@/constants/publish";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handleAppUninstalled = async (shop) => {
  console.log("App uninstalled", {
    shop,
  });

  try {
    const { error } = await supabase.from("shop").update({ access_token: null, installed: false }).eq("id", shop);
    await updateBillingPlan(shop, "free");
    if (error) {
      throw new Error(error.message);
    }

    await publish("UNINSTALL_APP", { shop, secret: process.env.SNS_SECRET });
  } catch (error) {
    console.error({
      message: "Error handling app uninstalled.",
      error,
      shop,
    });
  }
};
