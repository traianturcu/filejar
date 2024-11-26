import {
  verifyWebhook,
  handleCustomerDataRequest,
  handleCustomerRedact,
  handleShopRedact,
  handleAppUninstalled,
  handleOrderPaid,
  handleOrderCancelled,
  handleOrderUpdated,
  handleOrderFulfilled,
  handleOrderPartiallyFulfilled,
  handleRiskAssessmentChanged,
} from "@/lib/webhooks";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  try {
    const { valid, topic, body, shop } = await verifyWebhook(request);

    if (!valid || !topic || !shop) {
      throw new Error("Invalid webhook");
    }

    switch (topic) {
      case "app/uninstalled":
        await handleAppUninstalled(shop);
        break;
      case "customers/data_request":
        await handleCustomerDataRequest(shop, body);
        break;
      case "customers/redact":
        await handleCustomerRedact(shop, body);
        break;
      case "shop/redact":
        await handleShopRedact(shop);
        break;
      case "orders/paid":
        await handleOrderPaid(shop, body);
        break;
      case "orders/cancelled":
        await handleOrderCancelled(shop, body);
        break;
      case "orders/updated":
        await handleOrderUpdated(shop, body);
        break;
      case "orders/fulfilled":
        await handleOrderFulfilled(shop, body);
        break;
      case "orders/partially_fulfilled":
        await handleOrderPartiallyFulfilled(shop, body);
        break;
      case "orders/risk_assessment_changed":
        await handleRiskAssessmentChanged(shop, body);
        break;
    }

    return Response.json({}, { status: 200 });
  } catch (error) {
    console.error({
      message: "Error processing webhook",
      error,
      request,
    });
    return Response.json(
      {
        success: false,
        message: "Failed to process webhook",
      },
      { status: 500 }
    );
  }
};
