"use client";

import { useEffect } from "react";

const SegmentTrack = ({ eventName, properties = {} }) => {
  useEffect(() => {
    if (!window.analytics || !eventName) return;

    window?.analytics?.page();

    window?.analytics?.track(eventName, properties);
  }, [eventName, properties]);

  return null;
};

export default SegmentTrack;
