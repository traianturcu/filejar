"use client";

import ShopDetailsProvider from "@/components/ShopDetailsContext";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

const Providers = ({ children }) => {
  return (
    <PolarisProvider i18n={translations}>
      <ShopDetailsProvider>{children}</ShopDetailsProvider>
    </PolarisProvider>
  );
};

export default Providers;
