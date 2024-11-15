import { Stack, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Function, Runtime, Code, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { Topic, TopicPolicy, LambdaSubscription } from "aws-cdk-lib/aws-sns";
import { events } from "../src/constants/pubsub.mjs";

export class FileJarStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const env = process.env.BRANCH ?? "dev";
    const app = process.env.APP_NAME;

    const lambdas = {};

    // lambda function - uninstall notification
    const uninstallNotificationLambda = new Function(this, `${app}-${env}-uninstall-notification-lambda`, {
      runtime: Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: Code.fromAsset("../lambda/uninstall-notification"),
      environment: {
        SNS_SECRET: process.env.SNS_SECRET,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_TO_PHONE_NUMBER: process.env.TWILIO_TO_PHONE_NUMBER,
        TWILIO_FROM_PHONE_NUMBER: process.env.TWILIO_FROM_PHONE_NUMBER,
      },
      timeout: Duration.seconds(30),
      memorySize: 1024,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    uninstallNotificationLambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: ["*"],
      },
    });

    lambdas["uninstall-notification"] = uninstallNotificationLambda;

    // PUB/SUB System
    // create SNS topic and subscribe lambda functions and URL based on pubsub.mjs
    for (const event of events) {
      // create SNS topic
      const topic = new Topic(this, `${app}-${env}-${event.name}-topic`, {
        topicName: `${app}-${env}-${event.name}-topic`,
        displayName: `${app}-${env}-${event.name}-topic`,
      });

      // allow anyone to publish to the topic
      const topicPolicy = new TopicPolicy(this, `${app}-${env}-${event.name}-topic-policy`, {
        topics: [topic],
      });
      topicPolicy.document.addStatements(
        new PolicyStatement({
          actions: ["sns:Publish"],
          principals: [new AnyPrincipal("*")],
          resources: [topic.topicArn],
        })
      );

      // subscribe subscribers from pubsub.mjs
      for (const subscriber of event.subscribers) {
        if (!subscriber.handler || !subscriber.type) {
          console.error(`Subscriber ${subscriber.name} is missing handler or type`);
          continue;
        } else if (subscriber.type === "lambda") {
          const targetLambda = lambdas[subscriber.handler];
          if (targetLambda) {
            targetLambda.addPermission("AllowSNSInvoke", {
              principal: new ServicePrincipal("sns.amazonaws.com"),
              source: topic.topicArn,
            });
            topic.addSubscription(new LambdaSubscription(targetLambda));
          }
        } else if (subscriber.type === "url") {
          topic.addSubscription(
            new UrlSubscription(subscriber.handler, {
              protocol: SubscriptionProtocol.HTTPS,
            })
          );
        } else if (subscriber.type === "api") {
          const appUrl = process.env.APP_URL.replace(/\/$/, "");
          const handler = subscriber.handler.replace(/^\//, "");
          const url = `${appUrl}/${handler}`;
          topic.addSubscription(
            new ApiSubscription(url, {
              protocol: SubscriptionProtocol.HTTPS,
            })
          );
        }
      }
    }
  }
}
