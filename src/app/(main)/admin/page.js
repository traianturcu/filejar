"use client";

import { BlockStack, Box, Button, Card, Form, FormLayout, IndexTable, InlineStack, Layout, Page, Text, TextField, Tooltip } from "@shopify/polaris";
import { GiftCardIcon, ViewIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import { isLocalStorageAvailable } from "@/lib/client/admin";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { billingPlans } from "@/constants/billingPlans";

const headings = [
  { title: "Shop ID" },
  { title: "Primary Domain" },
  { title: "Email" },
  { title: "Shop Name" },
  { title: "Shopify Plan" },
  { title: "Actions" },
];

const AdminPage = () => {
  const [rows, setRows] = useState([]);
  const [queryValue, setQueryValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [specialOffersShop, setSpecialOffersShop] = useState(null);
  const [offers, setOffers] = useState([]);

  const shopify = useAppBridge();

  useEffect(() => {
    if (isLocalStorageAvailable()) {
      const impersonate = localStorage?.getItem("impersonate");
      if (impersonate) {
        setImpersonating(true);
      }
    }
  }, []);

  const openSpecialOffers = (shop) => {
    setSpecialOffersShop(shop);
    setOffers(rows.find((row) => row.myshopifyDomain === shop)?.offers ?? []);
    shopify.modal.show("special-offers-modal");
  };

  const hideSpecialOffers = () => {
    shopify.modal.hide("special-offers-modal");
  };

  const impersonate = (shop) => {
    if (!isLocalStorageAvailable()) return;

    localStorage.setItem("impersonate", shop);
    setImpersonating(true);
    window.location.reload();
  };

  const stopImpersonating = () => {
    if (!isLocalStorageAvailable()) return;
    localStorage.removeItem("impersonate");
    setImpersonating(false);
    window.location.reload();
  };

  const searchShops = async (query) => {
    setLoading(true);

    const data = await fetch("/api/admin/shops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!data.ok) {
      setRows([]);
      setLoading(false);
      return;
    }

    const json = await data.json();

    if (json?.shops?.length) {
      setRows(json.shops);
    } else {
      setRows([]);
    }

    setLoading(false);
  };

  const handleSearch = async () => {
    await searchShops(queryValue);
  };

  useEffect(() => {
    const runEffect = async () => {
      await searchShops();
    };

    runEffect();
  }, []);

  const updateDiscountPercentage = (planId, value) => {
    setOffers((prev) => [
      ...prev.filter((offer) => offer.id !== planId),
      { ...prev.find((offer) => offer.id === planId), id: planId, discountPercentage: value },
    ]);
  };

  const updateDiscountAmount = (planId, value) => {
    setOffers((prev) => [...prev.filter((offer) => offer.id !== planId), { ...prev.find((offer) => offer.id === planId), id: planId, discountAmount: value }]);
  };

  const updateDiscountDuration = (planId, value) => {
    setOffers((prev) => [
      ...prev.filter((offer) => offer.id !== planId),
      { ...prev.find((offer) => offer.id === planId), id: planId, durationLimitInIntervals: value },
    ]);
  };

  const updateExtendedFreeTrial = (planId, value) => {
    setOffers((prev) => [
      ...prev.filter((offer) => offer.id !== planId),
      { ...prev.find((offer) => offer.id === planId), id: planId, extendedFreeTrial: value },
    ]);
  };

  const saveSpecialOffers = async () => {
    setLoading(true);
    await fetch("/api/admin/save-special-offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shop: specialOffersShop, offers }),
    });
    shopify.modal.hide("special-offers-modal");
    await handleSearch();
    setLoading(false);
  };

  const rowMarkup =
    rows?.map((row) => {
      return (
        <IndexTable.Row key={row.myshopifyDomain}>
          <IndexTable.Cell>{row.myshopifyDomain}</IndexTable.Cell>
          <IndexTable.Cell>{row.primaryDomain?.host}</IndexTable.Cell>
          <IndexTable.Cell>{row.email}</IndexTable.Cell>
          <IndexTable.Cell>{row.name}</IndexTable.Cell>
          <IndexTable.Cell>{row.plan?.displayName}</IndexTable.Cell>
          <IndexTable.Cell>
            <InlineStack
              gap="200"
              wrap={false}
            >
              <Tooltip content="Impersonate Shop">
                <Button
                  variant="primary"
                  icon={ViewIcon}
                  onClick={() => {
                    impersonate(row.myshopifyDomain);
                  }}
                />
              </Tooltip>
              <Tooltip content="Special Offers">
                <Button
                  variant="primary"
                  icon={GiftCardIcon}
                  onClick={() => {
                    openSpecialOffers(row.myshopifyDomain);
                  }}
                />
              </Tooltip>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }) ?? [];

  if (impersonating && isLocalStorageAvailable()) {
    return (
      <Page title="Impersonating Shop">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text
                  fontWeight="bold"
                  as="p"
                >
                  {localStorage.getItem("impersonate")}
                </Text>
                <Button
                  variant="primary"
                  tone="critical"
                  onClick={stopImpersonating}
                >
                  Stop Impersonating
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Admin Area">
      <Layout>
        <Layout.Section>
          <Card roundedAbove="sm">
            <BlockStack gap="500">
              <InlineStack
                gap="200"
                wrap={false}
              >
                <TextField
                  value={queryValue}
                  onChange={setQueryValue}
                  placeholder="Shop"
                />
                <Button
                  variant="primary"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </InlineStack>
              <IndexTable
                resourceName={{ singular: "shop", plural: "shops" }}
                headings={headings}
                itemCount={rows.length}
                selectable={false}
                loading={loading}
              >
                {rowMarkup}
              </IndexTable>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      <Modal
        id="special-offers-modal"
        variant="large"
      >
        <Box padding="500">
          <BlockStack gap="500">
            <Text
              as="p"
              fontWeight="bold"
              alignment="center"
              variant="bodyLg"
            >
              {rows.find((row) => row.myshopifyDomain === specialOffersShop)?.name}
            </Text>
            {billingPlans
              .filter((plan) => plan.amount)
              .map((plan) => (
                <Card key={plan.id}>
                  <Layout>
                    <Layout.Section>
                      <BlockStack gap="500">
                        <Text
                          variant="bodyLg"
                          fontWeight="bold"
                        >
                          {plan.name}
                        </Text>
                        <FormLayout>
                          <TextField
                            label="Extended Free Trial"
                            type="number"
                            suffix="days"
                            autoComplete="off"
                            value={offers.find((offer) => offer.id === plan.id)?.extendedFreeTrial ?? 0}
                            onChange={(v) => updateExtendedFreeTrial(plan.id, v)}
                          />
                          <FormLayout.Group>
                            <TextField
                              label="Discount Duration"
                              type="number"
                              suffix="months"
                              autoComplete="off"
                              value={offers.find((offer) => offer.id === plan.id)?.durationLimitInIntervals ?? ""}
                              onChange={(v) => updateDiscountDuration(plan.id, v)}
                              helpText="Leave blank for lifetime discount"
                            />
                            <TextField
                              label="Discount Dollar Amount"
                              type="number"
                              prefix="$"
                              autoComplete="off"
                              value={offers.find((offer) => offer.id === plan.id)?.discountAmount ?? ""}
                              onChange={(v) => updateDiscountAmount(plan.id, v)}
                              error={
                                offers.find((offer) => offer.id === plan.id)?.discountPercentage && offers.find((offer) => offer.id === plan.id)?.discountAmount
                                  ? "Please set only one discount type"
                                  : ""
                              }
                            />
                            <TextField
                              label="Discount Percentage"
                              type="number"
                              suffix="%"
                              autoComplete="off"
                              value={offers.find((offer) => offer.id === plan.id)?.discountPercentage ?? ""}
                              onChange={(v) => updateDiscountPercentage(plan.id, v)}
                              error={
                                offers.find((offer) => offer.id === plan.id)?.discountPercentage && offers.find((offer) => offer.id === plan.id)?.discountAmount
                                  ? "Please set only one discount type"
                                  : ""
                              }
                            />
                          </FormLayout.Group>
                        </FormLayout>
                      </BlockStack>
                    </Layout.Section>
                  </Layout>
                </Card>
              ))}
          </BlockStack>
        </Box>
        <TitleBar title={`Special Offers for ${specialOffersShop}`}>
          <button
            variant="primary"
            onClick={saveSpecialOffers}
            disabled={loading || offers.some((offer) => offer.discountPercentage && offer.discountAmount) ? "" : undefined}
            loading={loading ? "" : undefined}
          >
            Save
          </button>
          <button onClick={hideSpecialOffers}>Cancel</button>
        </TitleBar>
      </Modal>
    </Page>
  );
};

export default AdminPage;
