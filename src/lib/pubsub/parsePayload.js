export const parsePayload = async (body) => {
  console.log("parsing payload", body);

  if (!body) {
    return null;
  }

  const { Message, Type, SubscribeURL } = body;

  console.log({ Message, Type, SubscribeURL });

  if (!Message || !Type || !SubscribeURL) {
    return null;
  }

  // check if the message is a subscription confirmation
  if (Type === "SubscriptionConfirmation") {
    console.log("confirming subscription");
    await fetch(SubscribeURL);
    return null;
  }

  const payload = JSON.parse(Message);
  console.log("parsed payload", payload);

  if (payload.secret !== process.env.SNS_SECRET) {
    return null;
  }

  return payload;
};
