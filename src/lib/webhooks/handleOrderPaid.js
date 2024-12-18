import { publish } from "@/lib/pubsub";

export const handleOrderPaid = async (shop, order) => {
  try {
    await publish("ORDER_PAID", {
      shop,
      order,
    });
  } catch (error) {
    console.error("Error in handleOrderPaid", {
      error,
      shop,
      order,
    });
  }
};
