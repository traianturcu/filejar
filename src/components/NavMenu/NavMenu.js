"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShopDetails } from "@/components/ShopDetailsContext";
import { isLocalStorageAvailable } from "@/lib/client/admin";

const NavMenu = () => {
  const pathname = usePathname();
  const [impersonating, setImpersonating] = useState(false);
  const { shopDetails } = useShopDetails();

  useEffect(() => {
    if (isLocalStorageAvailable()) {
      const impersonate = localStorage?.getItem("impersonate");
      if (impersonate) {
        setImpersonating(true);
      }
    }
  }, []);

  return (
    <ui-nav-menu key={pathname}>
      <Link
        href="/"
        rel="home"
      >
        Home
      </Link>
      <Link href="/products">Products</Link>
      <Link href="/files">Files</Link>
      <Link href="/orders">Orders</Link>
      <Link href="/settings">Settings</Link>
      <Link href="/billing">Billing</Link>
      {!!shopDetails?.is_admin && <a href="/admin">Admin</a>}
      {!!impersonating && <a href="/admin">Impersonating</a>}
    </ui-nav-menu>
  );
};

export default NavMenu;
