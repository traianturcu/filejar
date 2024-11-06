import { getShop } from "@/lib/shop";

export const revalidate = 0;

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    const data = await getShop(shop);

    if (!data.billing_plan) {
      throw new Error("Shop billing plan not found");
    }

    if (data.billing_plan === "free") {
      throw new Error("Upgrade to use this feature");
    }

    return Response.json(
      {
        success: true,
        secret: "42",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};
