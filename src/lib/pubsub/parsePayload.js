export const parsePayload = async (body) => {
  if (!body) {
    return null;
  }

  const { Message, Type, SubscribeURL } = body;

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

  if (payload.secret !== process.env.SNS_SECRET) {
    return null;
  }

  return payload;
};
