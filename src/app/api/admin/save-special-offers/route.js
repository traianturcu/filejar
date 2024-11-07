import { saveSpecialOffers } from "@/lib/admin";

export const revalidate = 0;

export const POST = async (request) => {
  try {
    const { shop, offers } = await request.json();
    await saveSpecialOffers(shop, offers);
    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error({
      message: "Failed to save special offers",
      error,
    });
    return Response(
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
