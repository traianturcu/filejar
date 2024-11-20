"use client";

import { useState } from "react";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { Dashboard } from "@uppy/react";
import { useUppyWithSupabase } from "@/lib/client/uppy";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

const UploadFilesModal = ({ onHide }) => {
  const shopify = useAppBridge();

  const names = [];
  const onError = (error) => {
    console.error({ error });
  };

  const onComplete = (result) => {
    console.log({ result });
    for (const file of result?.successful) {
      if (file?.progress?.uploadComplete && file?.meta?.objectName) {
        names.push(file.meta.objectName);
      }
    }
  };

  const uppy = useUppyWithSupabase({ bucketName: "uploads", onError, onComplete });

  const hideUploadModal = () => {
    shopify.modal.hide("upload-files-modal");
  };

  return (
    <Modal
      id="upload-files-modal"
      onHide={async () => {
        const uniqueNames = [...new Set(names)];
        onHide(uniqueNames);
      }}
    >
      <TitleBar title="Add Files">
        <button onClick={hideUploadModal}>I&apos;m done uploading</button>
      </TitleBar>
      <Dashboard
        uppy={uppy}
        showProgressDetails={true}
        doneButtonHandler={null}
      />
    </Modal>
  );
};

export default UploadFilesModal;
