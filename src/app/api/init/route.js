import { verifyAccessToken } from "@/lib/auth";
import { verifyShopDetails } from "@/lib/shop";

export const revalidate = 0;

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");
    const sessionToken = request?.headers?.get("authorization")?.replace("Bearer ", "");

    if (!shop) {
      return Response.json(
        {
          success: false,
          message: "Shop header is missing",
        },
        {
          status: 401,
        }
      );
    }

    if (!sessionToken) {
      return Response.json(
        {
          success: false,
          message: "Session token is missing",
        },
        {
          status: 401,
        }
      );
    }

    await verifyAccessToken(shop, sessionToken);

    // TODO: setup a cron job to re-fetch the shop details every 24 hours
    // AND use the shop update webhook to update the details in real-time
    const shouldRefetchDetails = await verifyShopDetails(shop);

    // if active webhook are different from required webhooks update the webhooks

    // if there onboarding_complete is false, trigger onboarding flow

    return Response.json({
      success: true,
      shouldRefetchDetails,
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
