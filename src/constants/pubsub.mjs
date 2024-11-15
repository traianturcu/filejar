export const events = [
  {
    name: "UNINSTALL_APP",
    subscribers: [
      {
        handler: "api/notify/uninstall",
        type: "api",
      },
      {
        handler: "https://eoupfez8zuf2g9t.m.pipedream.net",
        type: "url",
      },
      {
        handler: "uninstall-notification",
        type: "lambda",
      },
    ],
  },
];
