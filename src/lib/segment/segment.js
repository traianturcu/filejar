import { Analytics } from "@segment/analytics-node";

export const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY,
  flushAt: 1,
});

export const track = async (properties) => {
  await new Promise((resolve) => {
    analytics.track(properties, resolve);
  });
};

export const identify = async (properties) => {
  await new Promise((resolve) => {
    analytics.identify(properties, resolve);
  });
};
