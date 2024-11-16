import { App } from "aws-cdk-lib";
import { FileJarStack } from "./FileJarStack.mjs";

const cdkapp = new App();

let env = process.env.BRANCH;
if (!env || env === "main") {
  env = "dev";
}
const app = process.env.APP_NAME;

new FileJarStack(cdkapp, `${app}-${env}`);
