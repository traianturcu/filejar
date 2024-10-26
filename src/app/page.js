"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { useState } from "react";

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
    <div>
      <h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>
      <p>
        <strong>Chosen Product:</strong> {chosenProduct?.title ?? <button onClick={selectProduct}>Select Product</button>}
      </p>
      {productData && <pre>{JSON.stringify(productData, null, 2)}</pre>}
      {shopDetails && <pre>{JSON.stringify(shopDetails, null, 2)}</pre>}
    </div>
  );
};

export default Home;
