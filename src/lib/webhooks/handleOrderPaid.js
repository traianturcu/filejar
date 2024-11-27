import { publish } from "@/lib/pubsub";
import updateIsDigital from "@/lib/orders/updateIsDigital";

export const handleOrderPaid = async (shop, order) => {
  try {
    await updateIsDigital(shop, order);
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
