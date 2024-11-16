export const events = [
  {
    name: "UNINSTALL_APP",
    subscribers: [
      {
        handler: "api/subscriber/notify/uninstall",
        type: "api",
      },
    ],
  },
];
