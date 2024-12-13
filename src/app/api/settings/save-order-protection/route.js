import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const {
      enabled,
      riskLevels,
      paymentStatus,
      limitDownloads,
      downloadLimit,
      limitTime,
      downloadDays,
      fraudRiskMessage,
      paymentStatusMessage,
      downloadLimitMessage,
      timeLimitMessage,
      manuallyRevokedMessage,
      orderCancelledMessage,
    } = await request.json();

    const { data: shopData } = await supabase.from("shop").select("settings").eq("id", shop).single();

    const { error } = await supabase
      .from("shop")
      .update({
        settings: {
          ...shopData?.settings,
          order_protection: {
            enabled,
            riskLevels,
            paymentStatus,
            limitDownloads,
            downloadLimit,
            limitTime,
            downloadDays,
            fraudRiskMessage,
            paymentStatusMessage,
            downloadLimitMessage,
            timeLimitMessage,
            manuallyRevokedMessage,
            orderCancelledMessage,
          },
        },
      })
      .eq("id", shop);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      message: "Successfully saved order protection settings",
    });
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to save order protection settings",
    });
    return Response.json(
      {
        success: false,
        message: "Failed to save order protection settings",
      },
      {
        status: 500,
      }
    );
  }
};
