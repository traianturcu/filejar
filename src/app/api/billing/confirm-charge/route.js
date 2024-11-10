import { getShop } from "@/lib/shop";
import { getActiveCharge, getChargePlan, updateBillingPlan } from "@/lib/billing";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  try {
    const shop = request?.nextUrl?.searchParams?.get("shop");

    if (!shop) {
      throw new Error("Error: Shop is missing");
    }

    const redirect_url = `https://admin.shopify.com/store/${shop.replace(".myshopify.com", "")}/apps/${process.env.APP_HANDLE}/billing`;

    const shopData = await getShop(shop);
    const accessToken = shopData?.access_token;
    if (!accessToken) {
      throw new Error("Error: Access token is missing");
    }

    const chargeId = await getActiveCharge(shop, accessToken);
    if (!chargeId) {
      // no active charge - must be on free plan
      return Response.redirect(redirect_url);
    }

    const planId = await getChargePlan(shop, chargeId);
    if (planId) {
      await updateBillingPlan(shop, planId);
    }

    return Response.redirect(redirect_url);
  } catch (error) {
    console.error({
      error,
      message: "Error confirming charge",
    });
    return Response.redirect(process.env.APP_URL);
  }
};
