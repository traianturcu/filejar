import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const handler = async (event) => {
  try {
    const messages = event.Records.map(async (record) => {
      const message = JSON.parse(record.Sns.Message);
      const { shop, secret } = message;

      if (secret !== process.env.SNS_SECRET) {
        throw new Error("Invalid secret");
      }

      const twilioResponse = await client.messages.create({
        to: process.env.TWILIO_TO_PHONE_NUMBER,
        from: process.env.TWILIO_FROM_PHONE_NUMBER,
        body: `Shopify app uninstalled: ${shop}`,
      });

      return twilioResponse.id;
    });

    const results = await Promise.all(messages);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        results,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error sending uninstall notification",
        success: false,
        error,
      }),
    };
  }
};
