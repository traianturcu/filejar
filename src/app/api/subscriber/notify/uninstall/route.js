import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const POST = async (req) => {
  try {
    const { Message } = await req.json();
    const { shop } = JSON.parse(Message);
    if (!shop) {
      throw new Error("Shop not found");
    }

    const twilioResponse = await client.messages.create({
      to: process.env.TWILIO_TO_PHONE_NUMBER,
      from: process.env.TWILIO_FROM_PHONE_NUMBER,
      body: `[API] ${process.env.APP_NAME} was uninstalled by ${shop}`,
    });

    return Response.json(
      {
        success: true,
        sid: twilioResponse.sid,
        message: "Message sent to twilio",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling twilio uninstall notification", error);
    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
};
