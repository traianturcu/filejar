import { updateAccessToken } from "@/lib/auth";
import { getShop, updateShopDetails } from "@/lib/shop";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const sessionToken = request?.headers?.get("authorization")?.replace("Bearer ", "");

    if (!shop) {
      throw new Error("Missing shop");
    }

    if (!sessionToken) {
      throw new Error("Missing session token");
    }

    const shop_data = await getShop(shop);

    let access_token = shop_data?.access_token;
    let details = shop_data?.details;
    let email_important = shop_data?.email_important;

    if (!access_token) {
      const new_access_token = await updateAccessToken(shop, sessionToken);
      if (new_access_token) {
        access_token = new_access_token;
      } else {
        throw new Error(`Failed to exchange token for ${shop}`);
      }
    }

    if (!details && access_token) {
      const success = await updateShopDetails(shop, access_token);
      if (!success) {
        throw new Error(`Failed to update shop details for ${shop}`);
      }
      // TODO: use the shop update webhook to update the details in real-time
    }

    let action = null;
    if (!email_important) {
      action = "welcome";
    }

    return Response.json({
      success: true,
      action,
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
