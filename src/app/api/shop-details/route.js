import { getShop } from "@/lib/shop";
import crypto from "crypto";

export const dynamic = "force-dynamic";
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
    const forced = request?.nextUrl?.searchParams?.get("forced");

    if (!shop) {
      throw new Error("Shop header is missing");
    }

    const data = await getShop(shop, forced);

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
    details.offers = data.offers;
    details.usage = data.usage;
    details.last_usage_check = data.last_usage_check;
    details.settings = data.settings;
    details.bandwidth = data.bandwidth;
    details.sender_email = data?.sender_email;
    details.sender_name = data?.sender_name;
    details.sender_verified = data?.sender_verified;
    details.cname_verified = data?.cname_verified;
    details.email_important = data?.email_important;
    details.private_smtp = data?.private_smtp;

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
