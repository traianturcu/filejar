import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const POST = async (req) => {
  try {
    const body = await req.json();

    if (!body) {
      throw new Error("No body found");
    }

    const { Message, Type, SubscribeURL } = body;

    // check if the message is a subscription confirmation
    if (Type === "SubscriptionConfirmation") {
      console("confirming subscription");
      await fetch(SubscribeURL);
      return Response.json(
        {
          success: true,
          message: "Subscription confirmed",
        },
        { status: 200 }
      );
    }

    const { shop, secret } = JSON.parse(Message);

    if (secret !== process.env.SNS_SECRET) {
      throw new Error("Invalid secret");
    }

    const twilioResponse = await client.messages.create({
      to: process.env.TWILIO_TO_PHONE_NUMBER,
      from: process.env.TWILIO_FROM_PHONE_NUMBER,
      body: `Shopify app uninstalled: ${shop}`,
    });

    return new Response.json(
      {
        success: true,
        sid: twilioResponse.sid,
        message: "Message sent to twilio",
      },
      { status: 200 }
    );
  } catch (error) {
    console("Error handling twilio uninstall notification", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};
