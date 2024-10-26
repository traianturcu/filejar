"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { useState } from "react";
import { BlockStack, Button, Card, Layout, Page, Text } from "@shopify/polaris";

const Home = () => {
  const [chosenProduct, setChosenProduct] = useState(null);
  const [productData, setProductData] = useState(null);
  const { shopDetails } = useShopDetails();

  const selectProduct = async () => {
    window?.analytics?.track("Button Click", {
      button: "Select Product",
      page: "Dashboard",
    });

    const products = await shopify.resourcePicker({
      type: "product",
      limit: 1,
    });
    if (!products?.[0]) {
      return;
    }

    setChosenProduct(products[0]);

    const res = await fetch("shopify:admin/api/graphql.json", {
      method: "POST",
      body: JSON.stringify({
        query: `
        query GetProduct($id: ID!) {
          product(id: $id) {
            title
            description
            media (first: 1) {
              edges {
                node {
                  ... on MediaImage {
                    id
                    alt
                    image {
                      url
                      width
                    }
                  }
                }
              }
            }
          }
        }
        `,
        variables: { id: products[0].id },
      }),
    });
    const { data } = await res.json();
    setProductData(data);
  };

  return (
    <Page title={process.env.NEXT_PUBLIC_APP_NAME}>
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card roundedAbove="sm">
            <BlockStack
              gap="400"
              align="center"
              inlineAlign="stretch"
            >
              <Text
                as="p"
                variant="bodyMd"
                fontWeight="semibold"
              >
                Chosen Product:
              </Text>
              {chosenProduct && (
                <Text
                  as="p"
                  variant="bodyMd"
                >
                  {chosenProduct.title}
                </Text>
              )}
              <Button
                variant="primary"
                onClick={selectProduct}
              >
                Select Product
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">{productData && <pre>{JSON.stringify(productData, null, 2)}</pre>}</Layout.Section>
      </Layout>
    </Page>
  );
};

export default Home;
