import { Stack, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Function, Runtime, Code, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { Topic, TopicPolicy, SubscriptionProtocol } from "aws-cdk-lib/aws-sns";
import { events } from "../src/lib/pubsub/events.mjs";
import { LambdaSubscription, UrlSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { PolicyStatement, ServicePrincipal, ArnPrincipal } from "aws-cdk-lib/aws-iam";

export class FileJarStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    let env = process.env.BRANCH;
    if (!env || env === "main") {
      env = "dev";
    }
    const app = process.env.APP_NAME;

    const lambdas = {};

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
          principals: [new ArnPrincipal("*")],
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
            new UrlSubscription(url, {
              protocol: SubscriptionProtocol.HTTPS,
            })
          );
        }
      }
    }
  }
}
