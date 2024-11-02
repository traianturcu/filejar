"use client";

import { BlockStack, Button, Card, IndexTable, InlineStack, Layout, Page, Text, TextField } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { isLocalStorageAvailable } from "@/lib/client/admin";

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

  useEffect(() => {
    if (isLocalStorageAvailable()) {
      const impersonate = localStorage?.getItem("impersonate");
      if (impersonate) {
        setImpersonating(true);
      }
    }
  }, []);

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
            <Button
              variant="plain"
              size="slim"
              onClick={() => {
                impersonate(row.myshopifyDomain);
              }}
            >
              Impersonate
            </Button>
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
              <InlineStack gap="200">
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
    </Page>
  );
};

export default AdminPage;
