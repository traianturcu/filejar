"use client";

import ColorPicker from "@/components/ColorPicker";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  FormLayout,
  TextField,
  Box,
  Badge,
  SkeletonThumbnail,
  SkeletonBodyText,
  SkeletonDisplayText,
  Checkbox,
  DropZone,
  Spinner,
  List,
  Thumbnail,
  Link,
  Button,
  RangeSlider,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { download_page_defaults } from "@/constants/download_page_defaults";

const DownloadPageTemplatePage = () => {
  const [message, setMessage] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [buttonText, setButtonText] = useState("");
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState("#000");
  const [buttonTextColor, setButtonTextColor] = useState("#fff");
  const [orderPrefix, setOrderPrefix] = useState("");

  const shopify = useAppBridge();
  const router = useRouter();
  const { shopDetails, refetchShopDetails } = useShopDetails();

  useEffect(() => {
    if (shopDetails) {
      setMessage(shopDetails.settings?.download_page_template?.message ?? download_page_defaults.message);
      setShowPoweredBy(shopDetails.settings?.download_page_template?.show_powered_by ?? download_page_defaults.show_powered_by);
      setButtonText(shopDetails.settings?.download_page_template?.button_text ?? download_page_defaults.button_text);
      setButtonBackgroundColor(shopDetails.settings?.download_page_template?.button_background_color ?? download_page_defaults.button_background_color);
      setButtonTextColor(shopDetails.settings?.download_page_template?.button_text_color ?? download_page_defaults.button_text_color);
      setOrderPrefix(shopDetails.settings?.download_page_template?.order_prefix ?? download_page_defaults.order_prefix);
    }
  }, [shopDetails]);

  const handleSave = async () => {
    const response = await fetch("/api/settings/save-download-page-template", {
      method: "POST",
      body: JSON.stringify({
        message,
        show_powered_by: showPoweredBy,
        button_text: buttonText,
        button_background_color: buttonBackgroundColor,
        button_text_color: buttonTextColor,
        order_prefix: orderPrefix,
      }),
    });
    const data = await response.json();
    if (data.success) {
      shopify.toast.show(data.message);
      router.push("/settings?selection=download-page");
      await refetchShopDetails();
    } else {
      shopify.toast.show(data.message);
    }
  };

  if (!shopDetails) {
    return (
      <Box
        padding="400"
        width="100%"
      >
        <BlockStack
          gap="400"
          align="center"
          inlineAlign="center"
        >
          <Spinner size="large" />
        </BlockStack>
      </Box>
    );
  }

  return (
    <Page
      title="Download Page Template"
      backAction={{
        content: "Settings",
        url: "/settings?selection=download-page",
      }}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
      }}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <BlockStack gap="200">
            <Card>
              <BlockStack gap="200">
                <FormLayout>
                  <FormLayout.Group condensed>
                    <ColorPicker
                      label="Button background"
                      color={buttonBackgroundColor}
                      setColor={setButtonBackgroundColor}
                    />
                    <ColorPicker
                      label="Button text color"
                      color={buttonTextColor}
                      setColor={setButtonTextColor}
                    />
                  </FormLayout.Group>
                  <TextField
                    label="Button text"
                    value={buttonText}
                    onChange={(value) => setButtonText(value)}
                    placeholder={download_page_defaults.button_text}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <FormLayout>
                  <TextField
                    label="Order prefix"
                    value={orderPrefix}
                    onChange={(value) => setOrderPrefix(value)}
                    placeholder={download_page_defaults.order_prefix}
                  />
                  <TextField
                    label="Thank you message"
                    value={message}
                    onChange={(value) => setMessage(value)}
                    multiline={6}
                    placeholder={download_page_defaults.message}
                  />
                  <Checkbox
                    checked={showPoweredBy}
                    onChange={() => setShowPoweredBy(!showPoweredBy)}
                    label={`Show ${process.env.NEXT_PUBLIC_APP_NAME} watermark`}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <Card roundedAbove="sm">
            <BlockStack
              gap="400"
              inlineAlign="start"
            >
              <Badge tone="info">Preview</Badge>

              <Box
                paddingBlockStart="600"
                paddingBlockEnd="600"
                paddingInline="400"
                width="100%"
              >
                <BlockStack
                  gap="400"
                  align="center"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="400"
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text
                      as="span"
                      variant="headingLg"
                      fontWeight="bold"
                    >
                      {orderPrefix}1234
                    </Text>
                  </InlineStack>
                  <InlineStack
                    gap="150"
                    align="start"
                    blockAlign="center"
                  >
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      jane.doe@gmail.com
                    </Text>
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      ·
                    </Text>
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      Jane Doe
                    </Text>
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      ·
                    </Text>
                    <Text
                      as="span"
                      variant="bodyLg"
                    >
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </InlineStack>
                  <Text
                    as="span"
                    variant="bodyLg"
                  >
                    {message}
                  </Text>

                  <BlockStack gap="800">
                    <InlineStack
                      gap="400"
                      blockAlign="center"
                      align="start"
                      wrap={false}
                    >
                      <SkeletonThumbnail size="large" />
                      <Box width="50%">
                        <BlockStack gap="400">
                          <SkeletonBodyText lines={1} />
                          <SkeletonDisplayText
                            lines={1}
                            size="small"
                          />
                        </BlockStack>
                      </Box>
                    </InlineStack>

                    <InlineStack
                      gap="800"
                      blockAlign="center"
                      align="start"
                      wrap={false}
                    >
                      <SkeletonBodyText lines={2} />

                      <button
                        style={{
                          backgroundColor: buttonBackgroundColor,
                          color: buttonTextColor,
                          padding: "10px 20px",
                          borderRadius: "5px",
                          width: "fit-content",
                          fontSize: "14px",
                          border: "none",
                          marginTop: "0px",
                          marginInline: "auto",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {buttonText}
                      </button>
                    </InlineStack>

                    <InlineStack
                      gap="800"
                      blockAlign="center"
                      align="start"
                      wrap={false}
                    >
                      <SkeletonBodyText lines={2} />

                      <button
                        style={{
                          backgroundColor: buttonBackgroundColor,
                          color: buttonTextColor,
                          padding: "10px 20px",
                          borderRadius: "5px",
                          width: "fit-content",
                          fontSize: "14px",
                          border: "none",
                          marginTop: "0px",
                          marginInline: "auto",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {buttonText}
                      </button>
                    </InlineStack>

                    <InlineStack
                      gap="400"
                      blockAlign="center"
                      align="start"
                      wrap={false}
                    >
                      <SkeletonThumbnail size="large" />
                      <Box width="50%">
                        <BlockStack gap="400">
                          <SkeletonBodyText lines={1} />
                          <SkeletonDisplayText
                            lines={1}
                            size="small"
                          />
                        </BlockStack>
                      </Box>
                    </InlineStack>

                    <InlineStack
                      gap="800"
                      blockAlign="center"
                      align="start"
                      wrap={false}
                    >
                      <SkeletonBodyText lines={2} />

                      <button
                        style={{
                          backgroundColor: buttonBackgroundColor,
                          color: buttonTextColor,
                          padding: "10px 20px",
                          borderRadius: "5px",
                          width: "fit-content",
                          fontSize: "14px",
                          border: "none",
                          marginTop: "0px",
                          marginInline: "auto",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {buttonText}
                      </button>
                    </InlineStack>
                  </BlockStack>

                  {showPoweredBy && (
                    <>
                      <div style={{ height: "1px", backgroundColor: "#e0e0e0", marginBlock: "24px" }} />
                      <Box paddingBlockStart="600">
                        <Text
                          as="span"
                          variant="bodySm"
                          alignment="center"
                        >
                          Powered by{" "}
                          <a
                            className="email-link"
                            target="_blank"
                            href="https://filejar.com"
                          >
                            {process.env.NEXT_PUBLIC_APP_NAME}
                          </a>
                        </Text>
                      </Box>
                    </>
                  )}
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      <Box padding="1200"></Box>
    </Page>
  );
};

export default DownloadPageTemplatePage;
