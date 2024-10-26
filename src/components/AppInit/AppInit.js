"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const AppInit = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname || !router) {
      return;
    }

    const runEffect = async () => {
      const res = await fetch("/api/init");
      const { success, message, action } = await res.json();

      if (action === "welcome" && pathname !== "/welcome") {
        router.push("/welcome");
      } else if (!success) {
        console.error(message);
      }
    };

    runEffect();
  }, [pathname, router]);

  return null;
};

export default AppInit;
