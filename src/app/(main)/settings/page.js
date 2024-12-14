"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Icon,
  OptionList,
  Button,
  FormLayout,
  TextField,
  List,
  Box,
  Spinner,
  ChoiceList,
} from "@shopify/polaris";
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
  DisabledIcon,
  ShieldNoneIcon,
  IdentityCardIcon,
  MoneyIcon,
  AlertTriangleIcon,
  ToggleOnIcon,
  CalendarTimeIcon,
  ToggleOffIcon,
  TextQuoteIcon,
} from "@shopify/polaris-icons";
import LockedBanner from "@/components/LockedBanner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useDebounce from "@/lib/utils/useDebounce";

const SettingsPage = () => {
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState(["high"]);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(["pending", "authorized", "refunded"]);
  const [limitDownloads, setLimitDownloads] = useState(["unlimited"]);
  const [downloadLimit, setDownloadLimit] = useState(3);
  const [limitTime, setLimitTime] = useState(["unlimited"]);
  const [downloadDays, setDownloadDays] = useState(30);
  const [enableOrderProtection, setEnableOrderProtection] = useState(false);
  const searchParams = useSearchParams();
  const { shopDetails } = useShopDetails();
  const router = useRouter();

  const [fraudRiskMessage, setFraudRiskMessage] = useState(null);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState(null);
  const [downloadLimitMessage, setDownloadLimitMessage] = useState(null);
  const [timeLimitMessage, setTimeLimitMessage] = useState(null);
  const [manuallyRevokedMessage, setManuallyRevokedMessage] = useState(null);
  const [orderCancelledMessage, setOrderCancelledMessage] = useState(null);

  const [isSavingOrderProtection, setIsSavingOrderProtection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedFraudRiskMessage = useDebounce(fraudRiskMessage, 500);
  const debouncedPaymentStatusMessage = useDebounce(paymentStatusMessage, 500);
  const debouncedDownloadLimitMessage = useDebounce(downloadLimitMessage, 500);
  const debouncedTimeLimitMessage = useDebounce(timeLimitMessage, 500);
  const debouncedManuallyRevokedMessage = useDebounce(manuallyRevokedMessage, 500);
  const debouncedOrderCancelledMessage = useDebounce(orderCancelledMessage, 500);

  useEffect(() => {
    const selection = searchParams.get("selection");
    if (selection) {
      setSelectedOption([selection]);
    } else {
      setSelectedOption(["email"]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (shopDetails) {
      setEnableOrderProtection(shopDetails?.settings?.order_protection?.enabled ?? false);
      setSelectedRiskLevels(shopDetails?.settings?.order_protection?.riskLevels ?? ["high"]);
      setSelectedPaymentStatus(shopDetails?.settings?.order_protection?.paymentStatus ?? ["pending", "authorized", "refunded"]);
      setLimitDownloads(shopDetails?.settings?.order_protection?.limitDownloads ?? ["unlimited"]);
      setDownloadLimit(shopDetails?.settings?.order_protection?.downloadLimit ?? 3);
      setLimitTime(shopDetails?.settings?.order_protection?.limitTime ?? ["unlimited"]);
      setDownloadDays(shopDetails?.settings?.order_protection?.downloadDays ?? 30);
      setFraudRiskMessage(
        shopDetails?.settings?.order_protection?.fraudRiskMessage ??
          `Your access to this order has been revoked due to fraud risk. Please contact support at ${shopDetails?.email} for more information.`
      );
      setPaymentStatusMessage(
        shopDetails?.settings?.order_protection?.paymentStatusMessage ??
          `You can't access this order because the payment hasn't been completed yet. Please contact support at ${shopDetails?.email} for more information.`
      );
      setDownloadLimitMessage(
        shopDetails?.settings?.order_protection?.downloadLimitMessage ??
          `You can't access this order because you've reached the maximum access limit. Please contact support at ${shopDetails?.email} for more information.`
      );
      setTimeLimitMessage(
        shopDetails?.settings?.order_protection?.timeLimitMessage ??
          `You can't access this order because the order was placed too long ago. Please contact support at ${shopDetails?.email} for more information.`
      );
      setManuallyRevokedMessage(
        shopDetails?.settings?.order_protection?.manuallyRevokedMessage ??
          `Your access to this order has been revoked. Please contact support at ${shopDetails?.email} for more information.`
      );
      setOrderCancelledMessage(
        shopDetails?.settings?.order_protection?.orderCancelledMessage ??
          `This order has been cancelled and cannot be accessed. Please contact support at ${shopDetails?.email} for more information.`
      );
    }
  }, [shopDetails]);

  const saveOrderProtectionSettings = async () => {
    const response = await fetch(`/api/settings/save-order-protection`, {
      method: "POST",
      body: JSON.stringify({
        enabled: enableOrderProtection,
        riskLevels: selectedRiskLevels,
        paymentStatus: selectedPaymentStatus,
        limitDownloads: limitDownloads,
        downloadLimit: downloadLimit,
        limitTime: limitTime,
        downloadDays: downloadDays,
        fraudRiskMessage: debouncedFraudRiskMessage,
        paymentStatusMessage: debouncedPaymentStatusMessage,
        downloadLimitMessage: debouncedDownloadLimitMessage,
        timeLimitMessage: debouncedTimeLimitMessage,
        manuallyRevokedMessage: debouncedManuallyRevokedMessage,
        orderCancelledMessage: debouncedOrderCancelledMessage,
      }),
    });
    if (response.ok) {
      shopify.toast.show("Order protection settings saved successfully");
    } else {
      shopify.toast.show("Failed to save order protection settings");
    }
  };

  useEffect(() => {
    if (debouncedDownloadLimitMessage && !isInitialLoad) {
      setIsSavingOrderProtection(true);
    }
  }, [debouncedDownloadLimitMessage, isInitialLoad]);

  useEffect(() => {
    if (debouncedTimeLimitMessage && !isInitialLoad) {
      setIsSavingOrderProtection(true);
    }
  }, [debouncedTimeLimitMessage, isInitialLoad]);

  useEffect(() => {
    if (debouncedPaymentStatusMessage && !isInitialLoad) {
      setIsSavingOrderProtection(true);
    }
  }, [debouncedPaymentStatusMessage, isInitialLoad]);

  useEffect(() => {
    if (debouncedFraudRiskMessage && !isInitialLoad) {
      setIsSavingOrderProtection(true);
    }
  }, [debouncedFraudRiskMessage, isInitialLoad]);

  useEffect(() => {
    if (isSavingOrderProtection) {
      saveOrderProtectionSettings();
      setIsSavingOrderProtection(false);
    }
  }, [isSavingOrderProtection]);

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
                    label: "Order Protection",
                    value: "order-protection",
                    media: <Icon source={ShieldCheckMarkIcon} />,
                  },
                  {
                    label: "Private SMTP Server",
                    value: "private-smtp",
                    media: <Icon source={DatabaseIcon} />,
                  },
                  {
                    label: "Watermark PDFs",
                    value: "watermark-pdfs",
                    media: <Icon source={IdentityCardIcon} />,
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
          {!selectedOption?.[0] && (
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
          )}
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
          {selectedOption?.[0] === "order-protection" && (
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
                      <Icon source={ShieldCheckMarkIcon} />
                      <Text
                        variant="bodyLg"
                        fontWeight="bold"
                        as="h3"
                      >
                        Order Protection
                      </Text>
                    </InlineStack>
                    {!enableOrderProtection && (
                      <Button
                        variant="primary"
                        icon={ToggleOnIcon}
                        onClick={() => {
                          setEnableOrderProtection(true);
                          setIsSavingOrderProtection(true);
                        }}
                        size="medium"
                        disabled={shopDetails?.billing_plan === "free"}
                      >
                        Enable
                      </Button>
                    )}
                    {enableOrderProtection && (
                      <InlineStack
                        gap="200"
                        align="end"
                        blockAlign="center"
                      >
                        <Button
                          variant="secondary"
                          icon={ToggleOffIcon}
                          onClick={() => {
                            setEnableOrderProtection(false);
                            setIsSavingOrderProtection(true);
                          }}
                          size="medium"
                        >
                          Disable
                        </Button>
                      </InlineStack>
                    )}
                  </InlineStack>
                  <Text variant="bodyMd">
                    To protect your files from being downloaded by unauthorized users, you can block access based on any of the automatic conditions below.
                    Access can be manually overridden for each order/customer.
                  </Text>
                </BlockStack>
              </Card>
              {enableOrderProtection && (
                <>
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
                          <Icon source={AlertTriangleIcon} />
                          <Text
                            variant="bodyLg"
                            fontWeight="bold"
                            as="h3"
                          >
                            Fraud Risk
                          </Text>
                        </InlineStack>
                      </InlineStack>
                      <ChoiceList
                        allowMultiple
                        title="Block access if the risk level is:"
                        choices={[
                          { label: "High", value: "high" },
                          { label: "Medium", value: "medium" },
                        ]}
                        selected={selectedRiskLevels}
                        onChange={(value) => {
                          setSelectedRiskLevels(value);
                          setIsSavingOrderProtection(true);
                        }}
                      />
                      <TextField
                        label="Message"
                        placeholder={`Your access to this order has been revoked due to fraud risk. Please contact support at ${shopDetails?.email} for more information.`}
                        value={fraudRiskMessage}
                        onChange={(value) => {
                          setFraudRiskMessage(value);
                          setIsInitialLoad(false);
                        }}
                      />
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
                          <Icon source={MoneyIcon} />
                          <Text
                            variant="bodyLg"
                            fontWeight="bold"
                            as="h3"
                          >
                            Payment Status
                          </Text>
                        </InlineStack>
                      </InlineStack>
                      <ChoiceList
                        allowMultiple
                        title="Block access if the payment status is:"
                        choices={[
                          { label: "Pending", value: "pending" },
                          { label: "Authorized", value: "authorized" },
                          { label: "Refunded", value: "refunded" },
                          { label: "Partially Paid", value: "partially_paid" },
                        ]}
                        selected={selectedPaymentStatus}
                        onChange={(value) => {
                          setSelectedPaymentStatus(value);
                          setIsSavingOrderProtection(true);
                        }}
                      />
                      <TextField
                        label="Message"
                        placeholder={`You can't access this order because the payment hasn't been completed yet. Please contact support at ${shopDetails?.email} for more information.`}
                        value={paymentStatusMessage}
                        onChange={(value) => {
                          setPaymentStatusMessage(value);
                          setIsInitialLoad(false);
                        }}
                      />
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
                          <Icon source={PageDownIcon} />
                          <Text
                            variant="bodyLg"
                            fontWeight="bold"
                            as="h3"
                          >
                            Download Limit
                          </Text>
                        </InlineStack>
                      </InlineStack>
                      <ChoiceList
                        choices={[
                          { label: "Allow customers to access the download page unlimited times", value: "unlimited" },
                          { label: "Limit the number of times customers can access the download page", value: "limited" },
                        ]}
                        selected={limitDownloads}
                        onChange={(value) => {
                          setLimitDownloads(value);
                          setIsSavingOrderProtection(true);
                        }}
                      />
                      {limitDownloads?.[0] === "limited" && (
                        <>
                          <TextField
                            suffix="times"
                            type="number"
                            value={downloadLimit}
                            onChange={(value) => {
                              setDownloadLimit(value);
                              setIsSavingOrderProtection(true);
                            }}
                          />
                          <TextField
                            label="Message"
                            placeholder={`You can't access this order because you've reached the maximum access limit. Please contact support at ${shopDetails?.email} for more information.`}
                            value={downloadLimitMessage}
                            onChange={(value) => {
                              setDownloadLimitMessage(value);
                              setIsInitialLoad(false);
                            }}
                          />
                        </>
                      )}
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
                          <Icon source={CalendarTimeIcon} />
                          <Text
                            variant="bodyLg"
                            fontWeight="bold"
                            as="h3"
                          >
                            Download Time
                          </Text>
                        </InlineStack>
                      </InlineStack>
                      <ChoiceList
                        choices={[
                          { label: "Allow customers to access the download page at any time", value: "unlimited" },
                          { label: "Only allow access to the download page for a specific amount of time", value: "limited" },
                        ]}
                        selected={limitTime}
                        onChange={(value) => {
                          setLimitTime(value);
                          setIsSavingOrderProtection(true);
                        }}
                      />
                      {limitTime?.[0] === "limited" && (
                        <>
                          <TextField
                            suffix="days"
                            type="number"
                            value={downloadDays}
                            onChange={(value) => {
                              setDownloadDays(value);
                              setIsSavingOrderProtection(true);
                            }}
                          />
                          <TextField
                            label="Message"
                            placeholder={`You can't access this order because the order was placed too long ago. Please contact support at ${shopDetails?.email} for more information.`}
                            value={timeLimitMessage}
                            onChange={(value) => {
                              setTimeLimitMessage(value);
                              setIsInitialLoad(false);
                            }}
                          />
                        </>
                      )}
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
                          <Icon source={TextQuoteIcon} />
                          <Text
                            variant="bodyLg"
                            fontWeight="bold"
                            as="h3"
                          >
                            Other Messages
                          </Text>
                        </InlineStack>
                      </InlineStack>

                      <TextField
                        label="Manually revoked access"
                        placeholder={`Your access to this order has been revoked. Please contact support at ${shopDetails?.email} for more information.`}
                        value={manuallyRevokedMessage}
                        onChange={(value) => {
                          setManuallyRevokedMessage(value);
                          setIsInitialLoad(false);
                        }}
                      />

                      <TextField
                        label="Order cancelled"
                        placeholder={`This order has been cancelled and cannot be accessed. Please contact support at ${shopDetails?.email} for more information.`}
                        value={orderCancelledMessage}
                        onChange={(value) => {
                          setOrderCancelledMessage(value);
                          setIsInitialLoad(false);
                        }}
                      />
                    </BlockStack>
                  </Card>
                </>
              )}
            </BlockStack>
          )}
        </Layout.Section>
      </Layout>
      <Box padding="1200"></Box>
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
