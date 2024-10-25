"use client";

import { useEffect } from "react";
import { useShopDetails } from "@/components/ShopDetailsContext";

const AppInit = () => {
  const { refetchShopDetails } = useShopDetails();

  useEffect(() => {
    const runEffect = async () => {
      const res = await fetch("/api/init");
      const { success, message, action, shouldRefetchDetails } = await res.json();

      if (shouldRefetchDetails) {
        refetchShopDetails();
      }

      if (!success && action === "welcome") {
        console.log("trigger welcome flow");
      } else if (!success) {
        console.error(message);
      }
    };

    runEffect();
  }, []);

  return null;
};

export default AppInit;
