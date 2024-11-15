import { App } from "aws-cdk-lib";
import { FileJarStack } from "./FileJarStack.mjs";

const cdkapp = new App();

const env = process.env.BRANCH ?? "dev";
const app = process.env.APP_NAME;

new FileJarStack(cdkapp, `${app}-${env}`);
