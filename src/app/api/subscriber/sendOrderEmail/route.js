export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop, order } = JSON.parse(Message);
    if (!shop || !order) {
      throw new Error("Shop or order not found");
    }

    // TODO: check if we should send an email:
    // - the order is paid
    // - fulfillable items have corresponding files
    // - the order is not high risk

    console.log("send email", {
      shop,
      order,
    });

    return Response.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling orderPaidToDB", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};
