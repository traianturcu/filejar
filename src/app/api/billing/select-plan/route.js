import { billingPlans } from "@/constants/billingPlans";
import { createCharge } from "@/lib/billing";

export const POST = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    const { planId } = await request.json();

    if (!planId) {
      throw new Error("Plan ID is missing");
    }

    const plan = billingPlans.find((plan) => plan.id === planId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    const res = await createCharge(shop, plan);

    return new Response(JSON.stringify(res), {
      status: 200,
    });
  } catch (error) {
    console.error({
      error,
      message: "Error selecting billing plan",
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
