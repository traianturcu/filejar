export const events = [
  {
    name: "UNINSTALL_APP",
    subscribers: [
      {
        handler: "api/notify/uninstall",
        type: "api",
      },
      {
        handler: "uninstall-notification",
        type: "lambda",
      },
    ],
  },
];
