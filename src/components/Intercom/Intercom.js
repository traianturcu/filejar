"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { useEffect } from "react";

const Intercom = () => {
  const { shopDetails } = useShopDetails();

  useEffect(() => {
    if (!shopDetails?.intercom_user_hash) {
      return;
    }

    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
      user_id: shopDetails?.myshopifyDomain ?? "",
      name: shopDetails?.name ?? "",
      email: shopDetails?.email ?? "",
    };

    (function () {
      var w = window;
      var ic = w.Intercom;
      if (typeof ic === "function") {
        ic("reattach_activator");
        ic("update", w.intercomSettings);
      } else {
        var d = document;
        var i = function () {
          i.c(arguments);
        };
        i.q = [];
        i.c = function (args) {
          i.q.push(args);
        };
        w.Intercom = i;
        var l = function () {
          var s = d.createElement("script");
          s.type = "text/javascript";
          s.async = true;
          s.src = "https://widget.intercom.io/widget/" + process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
          var x = d.getElementsByTagName("script")[0];
          x.parentNode.appendChild(s);
        };
        if (document.readyState === "complete") {
          l();
        } else if (w.attachEvent) {
          w.attachEvent("onload", l);
        } else {
          w.addEventListener("load", l, false);
        }
      }
    })();

    window.Intercom("boot", {
      app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
      email: shopDetails?.email ?? "",
      user_id: shopDetails?.myshopifyDomain ?? "",
      name: shopDetails?.name ?? "",
      plan: shopDetails.plan.displayName,
      shopifyPlus: shopDetails.plan.shopifyPlus,
      dev: shopDetails.plan.partnerDevelopment,
      ownerName: shopDetails.shopOwnerName,
      primaryDomain: shopDetails.primaryDomain.host,
      country: shopDetails.billingAddress.country,
      currency: shopDetails.currencyCode,
      createdAt: shopDetails.createdAt,
      user_hash: shopDetails?.intercom_user_hash,
    });
  }, [shopDetails]);

  return null;
};

export default Intercom;
