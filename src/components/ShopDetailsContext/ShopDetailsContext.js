"use client";

import { createContext, useState, useEffect, useContext } from "react";

const ShopDetailsContext = createContext();

const ShopDetailsProvider = ({ children }) => {
  const [shopDetails, setShopDetails] = useState(null);

  const runEffect = async (forced = false) => {
    const res = await fetch(`/api/shop-details?${forced ? "forced=true" : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (data?.details) {
      setShopDetails(data.details);
    }
  };

  useEffect(() => {
    runEffect();
  }, []);

  return (
    <ShopDetailsContext.Provider value={{ setShopDetails, shopDetails, refetchShopDetails: runEffect, refetchShopDetailsForced: () => runEffect(true) }}>
      {children}
    </ShopDetailsContext.Provider>
  );
};

export const useShopDetails = () => {
  const context = useContext(ShopDetailsContext);
  if (!context) {
    throw new Error("useShopDetails must be used within a ShopDetailsProvider");
  }
  return context;
};

export default ShopDetailsProvider;
