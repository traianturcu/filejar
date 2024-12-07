"use client";

import { useEffect, useRef, useState } from "react";
import { BlockStack, Labelled, Popover } from "@shopify/polaris";
import { HexColorInput, HexColorPicker } from "react-colorful";

const ColorPicker = ({ label, color, setColor }) => {
  const [popoverActive, setPopoverActive] = useState(false);
  const activatorRef = useRef(null);

  useEffect(() => {
    if (activatorRef.current !== null) {
      activatorRef.current.style.backgroundColor = color;
    }
  }, [color]);

  const activator = (
    <div
      ref={activatorRef}
      style={{
        height: "32px",
        cursor: "pointer",
        padding: "6px",
        borderRadius: "8px",
        border: "1px solid rgb(48, 48,48)",
      }}
      onClick={() => setPopoverActive(true)}
    />
  );

  return (
    <Labelled label={label}>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={() => setPopoverActive(false)}
        ariaHaspopup={false}
        sectioned
      >
        <BlockStack gap="200">
          <HexColorPicker
            color={color}
            onChange={setColor}
          />
          <HexColorInput
            color={color}
            onChange={setColor}
            prefixed
          />
        </BlockStack>
      </Popover>
    </Labelled>
  );
};

export default ColorPicker;
