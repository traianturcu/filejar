"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import formatDateTime from "@/lib/utils/formatDateTime";
import formatFileSize from "@/lib/utils/formatFileSize";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Badge, Bleed, BlockStack, Box, Button, Card, Icon, InlineStack, Layout, Link, Page, Spinner, Text } from "@shopify/polaris";
import { CheckCircleIcon, DisabledIcon, EmailIcon, ExternalSmallIcon, FileIcon, ResetIcon } from "@shopify/polaris-icons";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const OrderManagePage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendEmailLoading, setResendEmailLoading] = useState(false);
  const [download_link, setDownloadLink] = useState(null);
  const [toggleAccessLoading, setToggleAccessLoading] = useState(false);
  const [order_access, setOrderAccess] = useState(true);
  const [order_access_reason, setOrderAccessReason] = useState(null);

  const router = useRouter();
  const shopify = useAppBridge();
  const { shopDetails } = useShopDetails();

  useEffect(() => {
    const payment_badge_labels = {
      pending: "Pending",
      authorized: "Authorized",
      partially_paid: "Partially Paid",
      paid: "Paid",
      partially_refunded: "Partially Refunded",
      refunded: "Refunded",
      voided: "Voided",
      default: "Unpaid",
    };

    if (order?.cancelled_at) {
      setOrderAccess(false);
      setOrderAccessReason("Order cancelled");
    } else if (order?.access_enabled === false) {
      setOrderAccess(false);
      setOrderAccessReason("Manually revoked");
    } else if (order?.access_enabled === true) {
      setOrderAccess(true);
      setOrderAccessReason(null);
    } else {
      if (shopDetails?.settings?.order_protection?.enabled === true) {
        // fraud risk
        const risk_levels = shopDetails?.settings?.order_protection?.riskLevels;
        const fraud_risk = order?.fraud_risk;
        if (risk_levels?.includes(fraud_risk)) {
          setOrderAccess(false);
          setOrderAccessReason(`The fraud risk of ${fraud_risk} is above the permitted threshold.`);
        }

        // payment status
        const payment_status = order?.payment_status;
        const payment_statuses = shopDetails?.settings?.order_protection?.paymentStatus;
        if (payment_statuses?.includes(payment_status)) {
          setOrderAccess(false);
          setOrderAccessReason(`The payment status of ${payment_badge_labels[payment_status] ?? payment_status} is not permitted.`);
        }

        // time limit
        if (shopDetails?.settings?.order_protection?.limitTime?.[0] === "limited") {
          const time_limit = parseInt(shopDetails?.settings?.order_protection?.downloadDays) || 0;
          const order_date = new Date(order?.created_at);
          const current_date = new Date();
          const time_difference = Math.floor((current_date - order_date) / (1000 * 60 * 60 * 24));
          if (time_difference > time_limit) {
            setOrderAccess(false);
            setOrderAccessReason(`The order was placed more than ${time_limit} days ago.`);
          }
        }

        // number of access attempts
        // TODO: check number of access attempts
        if (shopDetails?.settings?.order_protection?.limitDownloads?.[0] === "limited") {
          const download_limit = parseInt(shopDetails?.settings?.order_protection?.downloadLimit) || 0;
          const access_count = order?.access_count ?? 0;
          if (access_count >= download_limit) {
            setOrderAccess(false);
            setOrderAccessReason(`The download page has been accessed the maximum allowed of ${download_limit} times.`);
          }
        }
      }
    }
  }, [shopDetails, order]);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const res = await fetch(`/api/orders/get?id=${id}`);
      const { order, products, files, download_link } = await res.json();
      setOrder(order);
      setProducts(products);
      setFiles(files);
      setLoading(false);
      setDownloadLink(download_link);
    };

    fetchOrder();
  }, [id]);

  const resendEmail = async () => {
    try {
      setResendEmailLoading(true);
      const res = await fetch(`/api/orders/resendEmail?id=${id}`);
      const { success, events } = await res.json();
      if (success) {
        shopify.toast.show("Email resent");
        setOrder({
          ...order,
          events,
        });
      } else {
        shopify.toast.show("Failed to resend email", {
          tone: "critical",
        });
      }
    } catch (error) {
      shopify.toast.show("Failed to resend email");
    } finally {
      setResendEmailLoading(false);
    }
  };

  const fulfillment_badges = {
    fulfilled: {
      progress: "complete",
      tone: "success",
    },
    restocked: {
      progress: "complete",
      tone: "critical",
    },
    partial: {
      progress: "partiallyComplete",
      tone: "warning",
    },
    default: {
      progress: "incomplete",
      tone: "attention",
    },
  };

  const fulfillment_badge_labels = {
    fulfilled: "Fulfilled",
    restocked: "Restocked",
    partial: "Partially Fulfilled",
    default: "Unfulfilled",
  };

  const payment_badges = {
    pending: {
      progress: "incomplete",
      tone: "attention",
    },
    authorized: {
      progress: "complete",
      tone: "success",
    },
    partially_paid: {
      progress: "partiallyComplete",
      tone: "warning",
    },
    paid: {
      progress: "complete",
      tone: "success",
    },
    partially_refunded: {
      progress: "partiallyComplete",
      tone: "critical",
    },
    refunded: {
      progress: "complete",
      tone: "critical",
    },
    voided: {
      progress: "complete",
      tone: "critical",
    },
    default: {
      progress: "incomplete",
      tone: "attention",
    },
  };

  const payment_badge_labels = {
    pending: "Pending",
    authorized: "Authorized",
    partially_paid: "Partially Paid",
    paid: "Paid",
    partially_refunded: "Partially Refunded",
    refunded: "Refunded",
    voided: "Voided",
    default: "Unpaid",
  };

  const event_list = [
    ...new Set(
      order?.events
        ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        ?.map((event) => {
          return `${event.action} on ${formatDateTime(event.created_at)}`;
        })
    ),
  ];

  const downloads_list =
    order?.downloads
      ?.sort((a, b) => new Date(b.download_date) - new Date(a.download_date))
      ?.map((download) => {
        return (
          <>
            Downloaded on {formatDateTime(download?.download_date)}:<br />
            <Text
              variant="bodySm"
              fontWeight="semibold"
              as="span"
            >
              {download?.original_file_name}
            </Text>
          </>
        );
      }) ?? [];

  const toggleAccess = async () => {
    setToggleAccessLoading(true);
    const res = await fetch(`/api/orders/toggleAccess?id=${id}`);
    const { success } = await res.json();
    if (success) {
      setOrder({
        ...order,
        access_enabled: !order?.access_enabled,
      });
    }
    setToggleAccessLoading(false);
  };

  if (!order || loading) {
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
      title={
        <BlockStack
          gap="50"
          align="center"
          inlineAlign="center"
        >
          <Text
            as="h1"
            variant="headingLg"
            fontWeight="bold"
          >
            Order #{order.order_name}
          </Text>
          <Text
            as="p"
            variant="bodyMd"
          >
            {formatDateTime(order?.created_at)}
          </Text>
        </BlockStack>
      }
      secondaryActions={[
        {
          content: "Resend email",
          icon: EmailIcon,
          onClick: () => {
            resendEmail();
          },
          loading: resendEmailLoading,
        },
      ]}
      backAction={{
        content: "Orders",
        onAction: () => {
          router.push("/orders");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <Bleed
                marginInline="400"
                marginBlock="400"
              >
                <BlockStack gap="200">
                  <Box padding="400">
                    <InlineStack
                      gap="200"
                      align="space-between"
                      blockAlign="center"
                    >
                      <Text
                        as="h3"
                        variant="bodyLg"
                        fontWeight="bold"
                      >
                        {products?.length ?? 0} Digital Product
                        {products?.length > 1 ? "s" : ""}
                      </Text>
                      <Button
                        icon={ExternalSmallIcon}
                        variant="secondary"
                        onClick={() => {
                          open(download_link, "_blank");
                        }}
                      >
                        Open download page
                      </Button>
                    </InlineStack>
                  </Box>
                  {order?.products?.map((order_product, index) => {
                    const variant_id = `gid://shopify/ProductVariant/${order_product?.variant_id}`;
                    const product = products?.find((product) => product?.variants?.includes(variant_id));

                    if (!product) return null;

                    const product_name = order_product?.name ?? product?.title;
                    const product_quantity = order_product?.quantity;
                    const product_settings = products?.find((product) => product?.gid === `gid://shopify/Product/${order_product?.product_id}`)?.settings;

                    const downloads = order?.downloads ?? [];
                    const downloads_count = order?.downloads_count ?? {};

                    const file_names = product?.files;

                    const product_files = files?.filter((file) => file_names?.includes(file.name));

                    return (
                      <div key={index}>
                        <hr />
                        <Box padding="400">
                          <BlockStack gap="400">
                            <InlineStack
                              gap="400"
                              align="space-between"
                              blockAlign="center"
                            >
                              <InlineStack
                                gap="200"
                                align="start"
                                blockAlign="center"
                              >
                                <Link
                                  onClick={() => {
                                    open(`shopify://admin/products/${product?.gid?.replace("gid://shopify/Product/", "")}`, "_blank");
                                  }}
                                >
                                  <img
                                    src={
                                      product?.details?.images?.[0]?.originalSrc ??
                                      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+Cjxzdmcgd2lkdGg9IjgwMHB4IiBoZWlnaHQ9IjgwMHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPHBhdGggZD0ibSA0IDEgYyAtMS42NDQ1MzEgMCAtMyAxLjM1NTQ2OSAtMyAzIHYgMSBoIDEgdiAtMSBjIDAgLTEuMTA5Mzc1IDAuODkwNjI1IC0yIDIgLTIgaCAxIHYgLTEgeiBtIDIgMCB2IDEgaCA0IHYgLTEgeiBtIDUgMCB2IDEgaCAxIGMgMS4xMDkzNzUgMCAyIDAuODkwNjI1IDIgMiB2IDEgaCAxIHYgLTEgYyAwIC0xLjY0NDUzMSAtMS4zNTU0NjkgLTMgLTMgLTMgeiBtIC01IDQgYyAtMC41NTA3ODEgMCAtMSAwLjQ0OTIxOSAtMSAxIHMgMC40NDkyMTkgMSAxIDEgcyAxIC0wLjQ0OTIxOSAxIC0xIHMgLTAuNDQ5MjE5IC0xIC0xIC0xIHogbSAtNSAxIHYgNCBoIDEgdiAtNCB6IG0gMTMgMCB2IDQgaCAxIHYgLTQgeiBtIC00LjUgMiBsIC0yIDIgbCAtMS41IC0xIGwgLTIgMiB2IDAuNSBjIDAgMC41IDAuNSAwLjUgMC41IDAuNSBoIDcgcyAwLjQ3MjY1NiAtMC4wMzUxNTYgMC41IC0wLjUgdiAtMSB6IG0gLTguNSAzIHYgMSBjIDAgMS42NDQ1MzEgMS4zNTU0NjkgMyAzIDMgaCAxIHYgLTEgaCAtMSBjIC0xLjEwOTM3NSAwIC0yIC0wLjg5MDYyNSAtMiAtMiB2IC0xIHogbSAxMyAwIHYgMSBjIDAgMS4xMDkzNzUgLTAuODkwNjI1IDIgLTIgMiBoIC0xIHYgMSBoIDEgYyAxLjY0NDUzMSAwIDMgLTEuMzU1NDY5IDMgLTMgdiAtMSB6IG0gLTggMyB2IDEgaCA0IHYgLTEgeiBtIDAgMCIgZmlsbD0iIzJlMzQzNCIgZmlsbC1vcGFjaXR5PSIwLjM0OTAyIi8+DQo8L3N2Zz4="
                                    }
                                    alt={product_name}
                                    width={75}
                                    height={75}
                                    style={{
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Link>
                                <BlockStack gap="50">
                                  <Link
                                    onClick={() => {
                                      open(`shopify://admin/products/${product?.gid?.replace("gid://shopify/Product/", "")}`, "_blank");
                                    }}
                                    monochrome
                                    removeUnderline
                                  >
                                    <Text
                                      as="h4"
                                      variant="headingMd"
                                      fontWeight="medium"
                                    >
                                      {order_product?.title}
                                    </Text>
                                  </Link>
                                  {order_product?.variant_title && (
                                    <Text
                                      as="p"
                                      variant="bodySm"
                                    >
                                      {order_product?.variant_title}
                                    </Text>
                                  )}
                                </BlockStack>
                              </InlineStack>
                              <InlineStack
                                gap="200"
                                align="end"
                                blockAlign="center"
                              >
                                <Text
                                  as="p"
                                  variant="body"
                                  fontWeight="medium"
                                >
                                  x {product_quantity}
                                </Text>
                              </InlineStack>
                            </InlineStack>
                            {product_files?.map((file, index) => {
                              const file_downloads = downloads_count?.[file?.id] ?? 0;

                              return (
                                <InlineStack
                                  key={file.id}
                                  gap="200"
                                  align="space-between"
                                  blockAlign="center"
                                >
                                  <InlineStack
                                    gap="200"
                                    align="start"
                                    blockAlign="center"
                                  >
                                    <div style={{ width: "20px" }}>
                                      <Icon source={FileIcon} />
                                    </div>
                                    <BlockStack gap="50">
                                      <Text
                                        as="p"
                                        variant="bodyLg"
                                      >
                                        {file?.user_metadata?.originalFileName}
                                      </Text>
                                      <Text
                                        as="p"
                                        variant="bodySm"
                                      >
                                        {formatFileSize(file?.metadata?.size)}
                                      </Text>
                                    </BlockStack>
                                  </InlineStack>
                                  <InlineStack
                                    gap="200"
                                    align="end"
                                    blockAlign="center"
                                  >
                                    {file_downloads} downloads
                                  </InlineStack>
                                </InlineStack>
                              );
                            })}
                          </BlockStack>
                        </Box>
                      </div>
                    );
                  })}
                </BlockStack>
              </Bleed>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineStack
                  gap="200"
                  align="space-between"
                  blockAlign="center"
                >
                  <Text
                    as="h3"
                    variant="bodyLg"
                    fontWeight="bold"
                  >
                    Order Access
                  </Text>
                  {order_access && (
                    <Badge
                      size="small"
                      tone="success"
                      progress="complete"
                    >
                      enabled
                    </Badge>
                  )}
                  {!order_access && (
                    <Badge
                      size="small"
                      tone="critical"
                      progress="incomplete"
                    >
                      revoked
                    </Badge>
                  )}
                </InlineStack>
                {order_access_reason && (
                  <Text
                    as="p"
                    variant="bodySm"
                  >
                    <b>Reason for revoked access:</b> {order_access_reason}
                  </Text>
                )}
                {order?.access_events?.map((event, index) => {
                  return (
                    <Text
                      key={index}
                      as="p"
                      variant="bodyMd"
                    >
                      Download page accessed {event.ip ? `from ${event.ip}` : ""} on {formatDateTime(event.timestamp)}
                    </Text>
                  );
                })}
                <Text
                  as="p"
                  variant="bodyMd"
                >
                  Order accessed{" "}
                  <b>
                    {order?.access_count}
                    {shopDetails?.settings?.order_protection?.limitDownloads?.[0] === "limited"
                      ? ` / ${shopDetails?.settings?.order_protection?.downloadLimit}`
                      : ""}{" "}
                  </b>
                  times.
                </Text>
                <InlineStack
                  gap="200"
                  align="end"
                  blockAlign="center"
                >
                  {order_access && (
                    <Button
                      variant="secondary"
                      tone="critical"
                      icon={DisabledIcon}
                      onClick={toggleAccess}
                    >
                      Revoke access
                    </Button>
                  )}
                  {!order_access && (
                    <Button
                      variant="primary"
                      icon={CheckCircleIcon}
                      onClick={toggleAccess}
                      loading={toggleAccessLoading}
                    >
                      Enable access
                    </Button>
                  )}
                </InlineStack>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineStack
                  gap="200"
                  align="space-between"
                  blockAlign="center"
                >
                  <Text
                    as="h3"
                    variant="bodyLg"
                    fontWeight="bold"
                  >
                    Order Status
                  </Text>
                </InlineStack>
                {order?.cancelled_at ? (
                  <Badge
                    size="small"
                    tone="warning"
                  >
                    Cancelled
                  </Badge>
                ) : (
                  <>
                    <Badge
                      size="small"
                      progress={fulfillment_badges[order?.fulfillment_status]?.progress ?? fulfillment_badges.default.progress}
                      tone={fulfillment_badges[order?.fulfillment_status]?.tone ?? fulfillment_badges.default.tone}
                    >
                      {fulfillment_badge_labels[order?.fulfillment_status] ?? fulfillment_badge_labels.default}
                    </Badge>
                    <Badge
                      size="small"
                      progress={payment_badges[order?.payment_status]?.progress ?? payment_badges.default.progress}
                      tone={payment_badges[order?.payment_status]?.tone ?? payment_badges.default.tone}
                    >
                      {payment_badge_labels[order?.payment_status] ?? payment_badge_labels.default}
                    </Badge>
                  </>
                )}
                {order?.fraud_risk === "high" && (
                  <Badge
                    size="small"
                    tone="critical"
                  >
                    High Risk
                  </Badge>
                )}
                {order?.fraud_risk === "medium" && (
                  <Badge
                    size="small"
                    tone="warning"
                  >
                    Medium Risk
                  </Badge>
                )}
                {order?.fraud_risk === "low" && (
                  <Badge
                    size="small"
                    tone="success"
                  >
                    Low Risk
                  </Badge>
                )}
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineStack
                  gap="200"
                  align="space-between"
                  blockAlign="center"
                >
                  <Text
                    as="h3"
                    variant="bodyLg"
                    fontWeight="bold"
                  >
                    Customer
                  </Text>
                </InlineStack>
                <Text
                  as="p"
                  variant="bodyMd"
                >
                  {order?.customer_first_name} {order?.customer_last_name}
                </Text>
                <Text
                  as="p"
                  variant="bodyMd"
                >
                  {order?.customer_email}
                </Text>
                <InlineStack
                  gap="200"
                  align="end"
                  blockAlign="center"
                >
                  <Button
                    variant="secondary"
                    icon={ExternalSmallIcon}
                    onClick={() => {
                      open(`shopify://admin/orders/${id}`, "_blank");
                    }}
                  >
                    View in Shopify
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text
                  as="h3"
                  variant="bodyLg"
                  fontWeight="bold"
                >
                  Order History
                </Text>
                {event_list?.map((event, index) => {
                  return (
                    <Text
                      key={index}
                      as="p"
                      variant="bodyMd"
                    >
                      {event}
                    </Text>
                  );
                })}
                <Text
                  as="p"
                  variant="bodyMd"
                >
                  Order placed on {formatDateTime(order?.created_at)}
                </Text>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text
                  as="h3"
                  variant="bodyLg"
                  fontWeight="bold"
                >
                  Downloads
                </Text>
                {downloads_list?.map((download, index) => {
                  return (
                    <Text
                      key={index}
                      as="p"
                      variant="bodyMd"
                    >
                      {download}
                    </Text>
                  );
                })}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
      <Box padding="1200"></Box>
    </Page>
  );
};

export default OrderManagePage;
