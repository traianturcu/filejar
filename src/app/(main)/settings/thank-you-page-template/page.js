"use client";

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
  Bleed,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { thankYouPageTemplateDefaults } from "@/constants/thankYouPageTemplateDefaults";

const ThankYouPageTemplatePage = () => {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [buttonText, setButtonText] = useState("");

  const shopify = useAppBridge();
  const router = useRouter();
  const { shopDetails, refetchShopDetails } = useShopDetails();

  useEffect(() => {
    if (shopDetails) {
      setHeadline(shopDetails.settings?.thank_you_page_template?.headline ?? thankYouPageTemplateDefaults.headline);
      setBody(shopDetails.settings?.thank_you_page_template?.body ?? thankYouPageTemplateDefaults.body);
      setButtonText(shopDetails.settings?.thank_you_page_template?.button_text ?? thankYouPageTemplateDefaults.button_text);
    }
  }, [shopDetails]);

  const handleSave = async () => {
    const response = await fetch("/api/settings/save-thank-you-page-template", {
      method: "POST",
      body: JSON.stringify({
        headline,
        body,
        button_text: buttonText,
      }),
    });
    const data = await response.json();
    if (data.success) {
      shopify.toast.show(data.message);
      router.push("/settings?selection=thank-you-page");
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
      title="Thank You Page Template"
      backAction={{
        content: "Settings",
        url: "/settings?selection=thank-you-page",
      }}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
      }}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <BlockStack gap="200">
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <FormLayout>
                  <TextField
                    label="Headline"
                    value={headline}
                    onChange={(value) => setHeadline(value)}
                    autoComplete="off"
                    placeholder={thankYouPageTemplateDefaults?.headline}
                  />
                  <TextField
                    label="Body"
                    value={body}
                    onChange={(value) => setBody(value)}
                    multiline={6}
                    placeholder={thankYouPageTemplateDefaults?.body}
                  />
                  <TextField
                    label="Button text"
                    value={buttonText}
                    onChange={(value) => setButtonText(value)}
                    placeholder={thankYouPageTemplateDefaults?.button_text}
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
              inlineAlign="center"
            >
              <Badge tone="info">Preview</Badge>

              <Box
                paddingBlockStart="600"
                paddingBlockEnd="600"
                paddingInline="400"
                width="75%"
              >
                <Card>
                  <Bleed
                    marginInline="400"
                    marginBlock="400"
                  >
                    <BlockStack gap="200">
                      <Box
                        paddingInline="400"
                        paddingBlockStart="400"
                        paddingBlockEnd="200"
                      >
                        <Text
                          as="h2"
                          variant="headingMd"
                        >
                          {headline}
                        </Text>
                      </Box>
                      <Box
                        paddingInline="400"
                        paddingBlockEnd="400"
                      >
                        <Text as="p">{body}</Text>
                      </Box>

                      <div style={{ width: "100%", height: "1px", backgroundColor: "#e0e0e0" }} />

                      <Box
                        paddingInline="400"
                        paddingBlock="400"
                      >
                        <div
                          style={{
                            backgroundColor: "#1979b9",
                            color: "#fff",
                            padding: "15px 20px",
                            borderRadius: "5px",
                            width: "fit-content",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          {buttonText}
                        </div>
                      </Box>
                    </BlockStack>
                  </Bleed>
                </Card>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      <Box padding="1200"></Box>
    </Page>
  );
};

export default ThankYouPageTemplatePage;
