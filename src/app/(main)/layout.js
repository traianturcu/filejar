import NavMenu from "@/components/NavMenu";
import "./globals.css";
import AppInit from "@/components/AppInit";
import Intercom from "@/components/Intercom";
import Segment from "@/components/Segment";
import Providers from "@/components/Providers";
import AdminScript from "@/components/AdminScript";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  other: {
    "shopify-api-key": process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>
      <body>
        <Providers>
          {children}
          <AppInit />
          <Intercom />
          <Segment />
          <NavMenu />
          <AdminScript />
        </Providers>
      </body>
    </html>
  );
}