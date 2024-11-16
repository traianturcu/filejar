import { events } from "@/lib/pubsub";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export const publish = async (event, payload) => {
  try {
    if (!events.find((e) => e.name === event)) {
      throw new Error(`Event ${event} not found`);
    }

    const sns = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
    });

    const topicArn = `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.AWS_APP_NAME}-${process.env.ENVIRONMENT}-${event}-topic`;

    payload.secret = process.env.SNS_SECRET;

    const params = {
      TopicArn: topicArn,
      Message: JSON.stringify(payload),
    };

    await sns.send(new PublishCommand(params));
  } catch (error) {
    console.error("Error publishing event", error);
    throw error;
  }
};
