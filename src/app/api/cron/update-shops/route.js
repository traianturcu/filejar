import { updateShopDetails } from "@/lib/shop";
import { getShopsToUpdate } from "@/lib/cron";

export const revalidate = 0;

export const GET = async (request) => {
  try {
    const shops = await getShopsToUpdate();
    const promises = shops?.map((shop) => updateShopDetails(shop.id, shop.access_token));
    await Promise.all(promises);
    return Response.json({
      success: true,
      shops: shops.length,
    });
  } catch (error) {
    console.error({
      error,
      message: "Error in cron job - update-shops",
    });
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
