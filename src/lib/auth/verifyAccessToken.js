import { createClient } from "@supabase/supabase-js";
import { tokenExchange } from "@/lib/auth";

export const verifyAccessToken = async (shop, sessionToken) => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data } = await supabase.from("shop").select("access_token").eq("id", shop).single();

    if (!data?.access_token) {
      // initiate token exchange
      const access_token = await tokenExchange(shop, sessionToken);
      if (!access_token) {
        throw new Error("Failed to exchange token");
      }
      const { error } = await supabase.from("shop").upsert({ id: shop, access_token }, { onConflict: ["id"] });

      if (error) {
        throw new Error("Error upserting access token: " + error.message);
      }
    }
  } catch (error) {
    console.error({
      error,
      shop,
      sessionToken,
      message: "Error in verifyAccessToken",
    });
  }
};
