"use client";

import { Modal, TitleBar } from "@shopify/app-bridge-react";
import FilesTable from "@/components/FilesTable";
import { AppProvider, Box } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import { useState } from "react";

const AddFilesModal = ({ selectedFiles, setSelectedFiles, refresh, setRefresh }) => {
  const [newFiles, setNewFiles] = useState([]);

  const closeAddFilesModal = () => {
    shopify.modal.hide("add-files-modal");
  };

  const saveFiles = () => {
    setSelectedFiles(newFiles);
    closeAddFilesModal();
  };

  const showUploadModal = () => {
    shopify.modal.hide("add-files-modal");
    shopify.modal.show("upload-files-modal");
  };

  return (
    <Modal
      id="add-files-modal"
      variant="large"
    >
      <AppProvider i18n={translations}>
        <Box padding="400">
          <FilesTable
            refresh={refresh}
            setRefresh={setRefresh}
            showUploadModal={showUploadModal}
            selectedFiles={selectedFiles}
            setSelectedFiles={setNewFiles}
          />
        </Box>
      </AppProvider>
      <TitleBar title="Add Files">
        <button onClick={closeAddFilesModal}>Cancel</button>
        <button
          variant="primary"
          onClick={saveFiles}
        >
          Save
        </button>
      </TitleBar>
    </Modal>
  );
};

export default AddFilesModal;
