"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavMenu = () => {
  const pathname = usePathname();

  return (
    <ui-nav-menu key={pathname}>
      <Link
        href="/"
        rel="home"
      >
        Home
      </Link>
      <Link href="/billing">Billing</Link>
      <Link href="/support">Support</Link>
    </ui-nav-menu>
  );
};

export default NavMenu;
