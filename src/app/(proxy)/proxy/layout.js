"use client";

import "./globals.css";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

export default function ProxyLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PolarisProvider i18n={translations}>{children}</PolarisProvider>
      </body>
    </html>
  );
}
