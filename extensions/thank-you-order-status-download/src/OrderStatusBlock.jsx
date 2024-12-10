import {
  reactExtension,
  Card,
  BlockStack,
  Heading,
  Text,
  Button,
  Link,
  Tag,
  useExtensionEditor,
  useOrder,
  useShop,
  useApi,
  useSubscription,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";

const orderDetailsBlock = reactExtension("customer-account.order-status.block.render", () => <DownloadDetails />);
export { orderDetailsBlock };

const DownloadDetails = () => {
  const [downloadUrl, setDownloadUrl] = useState("#");
  const [headline, setHeadline] = useState("Digital products");
  const [body, setBody] = useState("Your order contains digital products that can be downloaded using the link below.");
  const [buttonText, setButtonText] = useState("Access downloads");
  const [showPoweredBy, setShowPoweredBy] = useState(false);
  const [loading, setLoading] = useState(true);

  const editor = useExtensionEditor();
  const order = useOrder();
  const shop = useShop();
  const { checkoutToken } = useApi();
  const token = useSubscription(checkoutToken);

  useEffect(() => {
    const runEffect = async () => {
      if (order?.id && shop?.myshopifyDomain) {
        const order_id = order.id.replace(/gid:\/\/shopify\/(Order|OrderIdentity)\//, "");
        const isEditor = editor?.type === "checkout";
        const res = await fetch(
          `${process.env.APP_DOMAIN}/api/open/thank-you-page?order=${order_id}&shop=${shop.myshopifyDomain}&isEditor=${isEditor}&token=${token}`
        );
        const data = await res.json();
        if (data.url) {
          setDownloadUrl(data.url);
          if (data.headline) {
            setHeadline(data.headline);
          }
          if (data.body) {
            setBody(data.body);
          }
          if (data.buttonText) {
            setButtonText(data.buttonText);
          }
          if (data.showPoweredBy) {
            setShowPoweredBy(data.showPoweredBy);
          }
          setLoading(false);
        }
      }
    };

    runEffect();
  }, [order, shop, token, editor]);

  if (loading) {
    return null;
  }

  return (
    <Card padding>
      <BlockStack>
        {editor?.type === "checkout" && <Tag icon="info">PREVIEW</Tag>}
        <Heading>{headline}</Heading>
        <Text>{body}</Text>
        <Link
          external
          to={downloadUrl}
        >
          <Button>{buttonText}</Button>
        </Link>
        {showPoweredBy && (
          <BlockStack inlineAlignment="center">
            <Text
              size="small"
              subdued="subdued"
            >
              powered by{" "}
              <Link
                external
                to="https://filejar.com"
              >
                FileJar
              </Link>
            </Text>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
};
