"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { Page, Layout, Text, Card, BlockStack, InlineStack, Icon, OptionList, Button, FormLayout, TextField, List, Box, Spinner } from "@shopify/polaris";
import {
  PageDownIcon,
  EmailIcon,
  EmailNewsletterIcon,
  EditIcon,
  SendIcon,
  PageHeartIcon,
  SettingsIcon,
  RedoIcon,
  OrderFulfilledIcon,
  ShieldCheckMarkIcon,
  DatabaseIcon,
  PageClockIcon,
  NotificationIcon,
  ClockIcon,
} from "@shopify/polaris-icons";
import LockedBanner from "@/components/LockedBanner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const SettingsPage = () => {
  const [selectedOption, setSelectedOption] = useState(["email"]);

  // get search params
  const searchParams = useSearchParams();
  const selection = searchParams.get("selection");

  useEffect(() => {
    if (selection) {
      setSelectedOption([selection]);
    }
  }, [selection]);

  const { shopDetails } = useShopDetails();
  const router = useRouter();

  const customizeEmailTemplate = () => {
    router.push("/settings/email-template");
  };

  const customizeDownloadPageTemplate = () => {
    router.push("/settings/download-page-template");
  };

  const customizeThankYouPageTemplate = () => {
    router.push("/settings/thank-you-page-template");
  };

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section variant="oneThird">
          <Card roundedAbove="sm">
            <BlockStack gap="200">
              <OptionList
                selected={selectedOption}
                onChange={setSelectedOption}
                options={[
                  {
                    label: "Email",
                    value: "email",
                    media: <Icon source={EmailIcon} />,
                  },
                  {
                    label: "Download Page",
                    value: "download-page",
                    media: <Icon source={PageDownIcon} />,
                  },
                  {
                    label: "Thank You Page",
                    value: "thank-you-page",
                    media: <Icon source={PageHeartIcon} />,
                  },
                  {
                    label: "Order Delivery",
                    value: "order-delivery",
                    media: <Icon source={OrderFulfilledIcon} />,
                  },
                  {
                    label: "Private SMTP Server",
                    value: "private-smtp",
                    media: <Icon source={DatabaseIcon} />,
                  },
                  {
                    label: "Protect PDFs",
                    value: "protect-pdfs",
                    media: <Icon source={ShieldCheckMarkIcon} />,
                  },
                  {
                    label: "Download Limits",
                    value: "download-limits",
                    media: <Icon source={PageClockIcon} />,
                  },
                  {
                    label: "Notifications",
                    value: "notifications",
                    media: <Icon source={NotificationIcon} />,
                  },
                ]}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {selectedOption?.[0] === "email" && (
            <BlockStack gap="200">
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={EmailNewsletterIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Email Template
                      </Text>
                    </InlineStack>
                    <Button
                      variant="primary"
                      icon={EditIcon}
                      onClick={customizeEmailTemplate}
                    >
                      Customize
                    </Button>
                  </InlineStack>
                  <Text variant="bodyMd">Customize the email template to match your brand.</Text>
                </BlockStack>
              </Card>
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={SendIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Email Sender
                      </Text>
                    </InlineStack>
                  </InlineStack>
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField
                        placeholder={shopDetails?.name}
                        label="Name"
                      />
                      <TextField
                        placeholder={shopDetails?.email}
                        label="Email"
                        readOnly
                        disabled
                      />
                    </FormLayout.Group>
                  </FormLayout>
                </BlockStack>
              </Card>
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={RedoIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Reply-To Email
                      </Text>
                    </InlineStack>
                  </InlineStack>
                  <Text variant="bodyMd">This is the email address where customers will be able to reply to your emails.</Text>
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField
                        placeholder={shopDetails?.email}
                        label="Reply-To Email"
                        readOnly
                        disabled
                      />
                    </FormLayout.Group>
                  </FormLayout>
                </BlockStack>
              </Card>
            </BlockStack>
          )}
          {selectedOption?.[0] === "download-page" && (
            <BlockStack gap="200">
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={PageDownIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Download Page Template
                      </Text>
                    </InlineStack>
                    <Button
                      variant="primary"
                      icon={EditIcon}
                      onClick={customizeDownloadPageTemplate}
                    >
                      Customize
                    </Button>
                  </InlineStack>
                  <Text variant="bodyMd">Customize the email template to match your brand.</Text>
                </BlockStack>
              </Card>
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={ClockIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Order Processing Message
                      </Text>
                    </InlineStack>
                  </InlineStack>
                  <Text variant="bodyMd">The following message will be displayed on the download page if the order is still processing.</Text>
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField placeholder={`Your order is still processing. We'll send you an email when it's ready.`} />
                    </FormLayout.Group>
                  </FormLayout>
                </BlockStack>
              </Card>
            </BlockStack>
          )}
          {selectedOption?.[0] === "thank-you-page" && (
            <BlockStack gap="200">
              {shopDetails?.billing_plan === "free" && <LockedBanner />}
              <Card roundedAbove="sm">
                <BlockStack
                  gap="200"
                  align="start"
                  inlineAlign="space-between"
                >
                  <InlineStack
                    gap="200"
                    align="space-between"
                    blockAlign="center"
                  >
                    <InlineStack
                      gap="100"
                      align="center"
                      blockAlign="center"
                    >
                      <Icon source={PageHeartIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Thank You Page Template
                      </Text>
                    </InlineStack>
                    <Button
                      variant="primary"
                      icon={EditIcon}
                      onClick={customizeThankYouPageTemplate}
                      disabled={shopDetails?.billing_plan === "free"}
                    >
                      Customize
                    </Button>
                  </InlineStack>
                  <Text variant="bodyMd">Display a digital products download card post-purchase (on the Thank You page and on the Order Status page).</Text>
                </BlockStack>
              </Card>
              {shopDetails?.billing_plan !== "free" && (
                <Card roundedAbove="sm">
                  <BlockStack
                    gap="200"
                    align="start"
                    inlineAlign="space-between"
                  >
                    <InlineStack
                      gap="200"
                      align="space-between"
                      blockAlign="center"
                    >
                      <InlineStack
                        gap="100"
                        align="center"
                        blockAlign="center"
                      >
                        <Icon source={SettingsIcon} />
                        <Text
                          variant="bodyLg"
                          fontWeight="bold"
                          as="h3"
                        >
                          App Block Setup
                        </Text>
                      </InlineStack>
                    </InlineStack>
                    <Text variant="bodyMd">
                      In order to enable this feature you need to add the FileJar app block to the Thank You page and the Order Status page. Please follow the
                      steps below.
                    </Text>
                    <List type="bullet">
                      <List.Item>
                        Navigate to{" "}
                        <a
                          href="shopify://admin/settings/checkout"
                          target="_blank"
                        >
                          Settings &gt; Checkout
                        </a>
                      </List.Item>
                      <List.Item>
                        In the <b>Configurations</b> section, click on the <b>Customize</b> button. This will open the Theme Editor with the Checkout page
                        selected.
                      </List.Item>
                      <List.Item>
                        From the top dropdown menu, switch from <b>Checkout</b> to <b>Thank you</b>.
                      </List.Item>
                      <List.Item>
                        In the left <b>Sections</b> menu, click on <b>Add app block</b> and select <b>FileJar</b>.
                      </List.Item>
                      <List.Item>
                        You can move the app block to your preferred position on the page. Then click on the <b>Save</b> button in the top right corner.
                      </List.Item>
                      <List.Item>
                        Repeat the steps above for the <b>Order Status</b> page, by switching from <b>Thank you</b> to <b>Order status</b> in the top dropdown
                        menu.
                      </List.Item>
                    </List>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
};

const SettingsPageWithSuspense = () => {
  return (
    <Suspense
      fallback={
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
      }
    >
      <SettingsPage />
    </Suspense>
  );
};

export default SettingsPageWithSuspense;
