import { getShop } from "@/lib/shop";
import crypto from "crypto";

export const revalidate = 0;

const calc_intercom_user_hash = (shop) => {
  if (!shop) {
    return null;
  }

  return crypto.createHmac("sha256", process.env.INTERCOM_SECRET).update(shop).digest("hex");
};

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    const data = await getShop(shop);

    if (!data.details) {
      throw new Error("Shop details not found");
    }

    const details = data.details;

    details.intercom_user_hash = calc_intercom_user_hash(shop);

    const adminShops = process.env.ADMIN_SHOPS?.split(",") ?? [];
    details.is_admin = adminShops.includes(shop);
    details.billing_plan = data.billing_plan;
    details.billing_plan_start = data.billing_plan_start;
    details.billing_days_used = data.billing_days_used;
    details.onboarding = data.onboarding;

    return Response.json({
      success: true,
      details,
    });
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
