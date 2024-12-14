"use client";

import { BlockStack, Button, Card, Grid, Icon, InlineGrid, InlineStack, ProgressBar, Text } from "@shopify/polaris";
import formatFileSize from "@/lib/utils/formatFileSize";
import { useRouter } from "next/navigation";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { billingPlans } from "@/constants/billingPlans";
import { RefreshIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";

const UsageCard = () => {
  const router = useRouter();
  const { shopDetails, refetchShopDetailsForced } = useShopDetails();
  const [loading, setLoading] = useState(true);

  const billing_plan = shopDetails?.billing_plan;
  const billingPlan = billingPlans.find((p) => p.id === billing_plan);
  const plan = billingPlan?.name || "Free";
  const planOffers = shopDetails?.offers?.find((o) => o.id === billing_plan);

  const usedProducts = shopDetails?.usage?.products_usage && shopDetails?.usage?.products_usage !== "" ? Number(shopDetails?.usage?.products_usage) : 0;
  const usedStorage = shopDetails?.usage?.storage_usage && shopDetails?.usage?.storage_usage !== "" ? Number(shopDetails?.usage?.storage_usage) : 0;
  const usedFiles = shopDetails?.usage?.files_usage && shopDetails?.usage?.files_usage !== "" ? Number(shopDetails?.usage?.files_usage) : 0;
  const usedOrders = shopDetails?.usage?.orders_usage && shopDetails?.usage?.orders_usage !== "" ? Number(shopDetails?.usage?.orders_usage) : 0;
  const bandwidth = shopDetails?.bandwidth ?? 0;

  const totalProducts = planOffers?.total_products && planOffers?.total_products !== "" ? Number(planOffers?.total_products) : billingPlan?.totalProducts ?? 0;
  const totalStorage = planOffers?.total_storage && planOffers?.total_storage !== "" ? Number(planOffers?.total_storage) : billingPlan?.totalStorage ?? 0;
  const totalFiles = planOffers?.total_files && planOffers?.total_files !== "" ? Number(planOffers?.total_files) : billingPlan?.totalFiles ?? 0;
  const totalOrders = planOffers?.total_orders && planOffers?.total_orders !== "" ? Number(planOffers?.total_orders) : billingPlan?.totalOrders ?? 0;
  const totalBandwidth =
    planOffers?.total_bandwidth && planOffers?.total_bandwidth !== "" ? Number(planOffers?.total_bandwidth) : billingPlan?.totalBandwidth ?? 0;

  const productsProgress = totalProducts > 0 ? (usedProducts / totalProducts) * 100 : 0;
  const productsTone = productsProgress > 80 ? "critical" : "primary";

  const storageProgress = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;
  const storageTone = storageProgress > 80 ? "critical" : "primary";

  const filesProgress = totalFiles > 0 ? (usedFiles / totalFiles) * 100 : 0;
  const filesTone = filesProgress > 80 ? "critical" : "primary";

  const ordersProgress = totalOrders > 0 ? (usedOrders / totalOrders) * 100 : 0;
  const ordersTone = ordersProgress > 80 ? "critical" : "primary";

  const bandwidthProgress = totalBandwidth > 0 ? (bandwidth / totalBandwidth) * 100 : 0;
  const bandwidthTone = bandwidthProgress > 80 ? "critical" : "primary";

  const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const minutes_ago = shopDetails?.last_usage_check ? Math.round((new Date() - new Date(shopDetails?.last_usage_check)) / 60000) : 0;

  const refetchUsage = async () => {
    setLoading(true);
    await refetchShopDetailsForced();
    setLoading(false);
  };

  useEffect(() => {
    if (shopDetails?.billing_plan) {
      setLoading(false);
    }
  }, [shopDetails]);

  const formatTotal = (total) => {
    return total === -1 ? "∞" : total.toLocaleString();
  };

  return (
    <>
      <Card roundedAbove="sm">
        <BlockStack gap="400">
          <InlineStack
            gap="200"
            align="space-between"
          >
            <Text
              as="h4"
              variant="headingMd"
            >
              Usage
            </Text>
            <InlineStack gap="200">
              <Button
                onClick={() => {
                  router.push("/billing");
                }}
                variant={
                  storageTone === "critical" || productsTone === "critical" || filesTone === "critical" || ordersTone === "critical" ? "primary" : "secondary"
                }
              >
                {storageTone === "critical" || productsTone === "critical" || filesTone === "critical" || ordersTone === "critical"
                  ? "Upgrade to increase limits"
                  : "Manage your billing plan"}
              </Button>
            </InlineStack>
          </InlineStack>
          <BlockStack gap="100">
            <Text
              as="p"
              variant="bodyMd"
            >
              You are on the <b>{plan}</b> plan.
            </Text>
            {totalOrders !== -1 && (
              <Text
                as="p"
                variant="bodyMd"
              >
                Your orders limit will reset on <b>{resetDate}</b>.
              </Text>
            )}
          </BlockStack>
          <Card roundedAbove="sm">
            <Grid
              gap="400"
              columns={{ xs: 1, sm: 3, md: 4, lg: 4, xl: 4 }}
            >
              <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                <Text
                  as="h5"
                  variant="bodyMd"
                >
                  Products
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                <BlockStack
                  gap="100"
                  inlineAlign="end"
                >
                  <ProgressBar
                    size="small"
                    tone={productsTone}
                    progress={productsProgress}
                  />
                  <Text
                    as="p"
                    variant="bodyXs"
                  >
                    {loading ? "..." : `${usedProducts.toLocaleString()} / ${formatTotal(totalProducts)}`}
                  </Text>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Card>
          <Card roundedAbove="sm">
            <Grid
              gap="400"
              columns={{ xs: 1, sm: 3, md: 4, lg: 4, xl: 4 }}
            >
              <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                <Text
                  as="h5"
                  variant="bodyMd"
                >
                  Storage
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                <BlockStack
                  gap="100"
                  inlineAlign="end"
                >
                  <ProgressBar
                    size="small"
                    tone={storageTone}
                    progress={storageProgress}
                  />
                  <Text
                    as="p"
                    variant="bodyXs"
                  >
                    {loading ? "..." : `${formatFileSize(usedStorage, 2, "")} / ${totalStorage === -1 ? "∞" : formatFileSize(totalStorage, 2, "")}`}
                  </Text>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Card>
          <Card roundedAbove="sm">
            <Grid
              gap="400"
              columns={{ xs: 1, sm: 3, md: 4, lg: 4, xl: 4 }}
            >
              <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                <Text
                  as="h5"
                  variant="bodyMd"
                >
                  Bandwidth
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                <BlockStack
                  gap="100"
                  inlineAlign="end"
                >
                  <ProgressBar
                    size="small"
                    tone={bandwidthTone}
                    progress={bandwidthProgress}
                  />
                  <Text
                    as="p"
                    variant="bodyXs"
                  >
                    {loading ? "..." : `${formatFileSize(bandwidth, 2, "")} / ${totalBandwidth === -1 ? "∞" : formatFileSize(totalBandwidth, 2, "")}`}
                  </Text>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Card>
          <Card roundedAbove="sm">
            <Grid
              gap="400"
              columns={{ xs: 1, sm: 3, md: 4, lg: 4, xl: 4 }}
            >
              <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                <Text
                  as="h5"
                  variant="bodyMd"
                >
                  Files
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                <BlockStack
                  gap="100"
                  inlineAlign="end"
                >
                  <ProgressBar
                    size="small"
                    tone={filesTone}
                    progress={filesProgress}
                  />
                  <Text
                    as="p"
                    variant="bodyXs"
                  >
                    {loading ? "..." : `${usedFiles.toLocaleString()} / ${formatTotal(totalFiles)}`}
                  </Text>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Card>
          <Card roundedAbove="sm">
            <Grid
              gap="400"
              columns={{ xs: 1, sm: 3, md: 4, lg: 4, xl: 4 }}
            >
              <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                <Text
                  as="h5"
                  variant="bodyMd"
                >
                  Orders
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                <BlockStack
                  gap="100"
                  inlineAlign="end"
                >
                  <ProgressBar
                    size="small"
                    tone={ordersTone}
                    progress={ordersProgress}
                  />
                  <Text
                    as="p"
                    variant="bodyXs"
                  >
                    {loading ? "..." : `${usedOrders.toLocaleString()} / ${formatTotal(totalOrders)}`}
                  </Text>
                </BlockStack>
              </Grid.Cell>
            </Grid>
          </Card>
          <InlineStack
            gap="200"
            align="end"
            blockAlign="center"
          >
            <Text
              as="span"
              variant="bodyXs"
            >
              Usage data last updated {loading ? "..." : minutes_ago ?? "..."} minutes ago.
            </Text>
            <Button
              icon={RefreshIcon}
              onClick={refetchUsage}
              variant="secondary"
              size="small"
              loading={loading}
            />
          </InlineStack>
        </BlockStack>
      </Card>
    </>
  );
};

export default UsageCard;
