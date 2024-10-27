"use client";

import { BlockStack, Button, Card, IndexTable, InlineStack, Layout, Page, TextField } from "@shopify/polaris";
import { useState, useEffect } from "react";

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

  const searchShops = async (query) => {
    const data = await fetch("/api/admin/shops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!data.ok) {
      setRows([]);
      return;
    }

    const json = await data.json();

    if (json?.shops?.length) {
      setRows(json.shops);
    } else {
      setRows([]);
    }
  };

  const handleSearch = () => {
    searchShops(queryValue);
  };

  useEffect(() => {
    handleSearch();
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
            >
              Impersonate
            </Button>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }) ?? [];

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
