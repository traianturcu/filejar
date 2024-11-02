"use client";

import { useEffect } from "react";
import { isLocalStorageAvailable } from "@/lib/client/admin";

const AdminScript = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isLocalStorageAvailable()) return;

    (function () {
      try {
        const impersonate = localStorage?.getItem("impersonate");
        if (impersonate) {
          const originalFetch = window.fetch;
          window.fetch = async (resource, init = {}) => {
            if (!init.headers) {
              init.headers = {};
            }
            if (init.headers instanceof Headers) {
              const headersObj = {};
              init.headers.forEach((value, key) => {
                headersObj[key] = value;
              });
              init.headers = headersObj;
            }
            init.headers["x-impersonate"] = impersonate;
            return originalFetch(resource, init);
          };
        }
      } catch (error) {
        // local storage is not available
      }
    })();
  }, []);

  return null;
};

export default AdminScript;
