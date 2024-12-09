import {
  reactExtension,
  View,
  BlockStack,
  Heading,
  Text,
  Button,
  Link,
  Tag,
  useExtensionEditor,
  useApi,
  useSubscription,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";

const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => <DownloadDetails />);
export { thankYouBlock };

const DownloadDetails = () => {
  const [downloadUrl, setDownloadUrl] = useState("#");
  const [headline, setHeadline] = useState("Digital products");
  const [body, setBody] = useState("Your order contains digital products that can be downloaded using the link below.");
  const [buttonText, setButtonText] = useState("Access downloads");
  const [loading, setLoading] = useState(true);
  const editor = useExtensionEditor();
  const { orderConfirmation, checkoutToken, shop } = useApi();
  const { order } = useSubscription(orderConfirmation);
  const token = useSubscription(checkoutToken);

  useEffect(() => {
    const runEffect = async () => {
      if (order?.id && token && shop?.myshopifyDomain) {
        const order_id = order.id.replace(/gid:\/\/shopify\/(Order|OrderIdentity)\//, "");
        const isEditor = editor?.type === "checkout";
        const res = await fetch(
          `${process.env.APP_DOMAIN}/api/open/thank-you-page?order=${order_id}&token=${token}&shop=${shop.myshopifyDomain}&isEditor=${isEditor}`
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
          setLoading(false);
        }
      }
    };

    runEffect();
  }, [order, token, shop, editor]);

  if (loading) {
    return null;
  }

  return (
    <View
      border="base"
      padding="base"
      borderRadius="base"
    >
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
      </BlockStack>
    </View>
  );
};
