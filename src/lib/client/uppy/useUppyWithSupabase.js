"use client";

import { useShopDetails } from "@/components/ShopDetailsContext";
import { useAppBridge } from "@shopify/app-bridge-react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useUppyWithSupabase = ({ bucketName, onComplete, onError }) => {
  const [uppy] = useState(() => new Uppy());
  const shopify = useAppBridge();
  const { shopDetails } = useShopDetails();

  useEffect(() => {
    if (!shopDetails || !shopify || !uppy) return;

    const initUppy = async () => {
      const { token } = await fetch("/api/supabaseToken", { cache: "no-store" }).then((res) => res.json());
      const tus_instance = uppy.getPlugin("Tus");
      if (tus_instance) uppy.removePlugin(tus_instance);
      uppy
        .use(Tus, {
          id: "Tus",
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          uploadDataDuringCreation: true,
          headers: {
            apikey: token,
            authorization: `Bearer ${token}`,
          },
          removeFingerprintOnSuccess: true,
          chunkSize: 6 * 1024 * 1024,
          allowedMetaFields: ["bucketName", "objectName", "contentType", "originalFileName", "metadata"],
          onShouldRetry: (err, retryAtempt, options, next) => {
            if (err?.originalResponse?.getStatus() === 409) {
              // 409 - file already exists - don't retry upload
              return false;
            }
            return next(err);
          },
          onAfterResponse: (req, res) => {
            const status = res.getStatus();
            const body = res.getBody();
            if (status >= 400) {
              const errorMessage = body ?? `Upload failed with status ${status}`;
              const error = new Error(errorMessage);
              error.request = req;
              error.response = res;
              uppy.emit("upload-error", req.getURL(), error, res);
            }
          },
        })
        .on("file-added", (file) => {
          file.meta = {
            ...file.meta,
            bucketName,
            objectName: `${shopDetails.myshopifyDomain}/${uuidv4()}`,
            metadata: JSON.stringify({
              originalFileName: file.name,
            }),
            contentType: file.type,
          };
        })
        .on("complete", (result) => {
          if (result.successful) {
            onComplete(result);
          } else {
            onError(result);
          }
        })
        .on("upload-error", (file, error, response) => {
          console.error({ file, error, response });
          uppy.info(`Error uploading file: ${error.message}`, "error", 5000);
          // uppy.cancelAll();
          onError({ file, error, response });
        });
    };

    initUppy();

    return () => {
      uppy.cancelAll();
    };
  }, [shopDetails, shopify, uppy, bucketName, onComplete, onError]);

  return uppy;
};
