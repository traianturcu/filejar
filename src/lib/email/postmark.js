import { promises as dnsPromises } from "dns";

export const addDomain = async (domain) => {
  try {
    const response = await fetch(`https://api.postmarkapp.com/domains`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Account-Token": process.env.POSTMARK_ACCOUNT_TOKEN,
      },
      body: JSON.stringify({
        Name: domain,
        ReturnPathDomain: `pm-bounces.${domain}`,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getDomain = async (domain_id) => {
  const response = await fetch(`https://api.postmarkapp.com/domains/${domain_id}`, {
    headers: {
      Accept: "application/json",
      "X-Postmark-Account-Token": process.env.POSTMARK_ACCOUNT_TOKEN,
    },
  });
  const data = await response.json();
  return data;
};

export const deleteDomain = async (domain_id) => {
  const response = await fetch(`https://api.postmarkapp.com/domains/${domain_id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "X-Postmark-Account-Token": process.env.POSTMARK_ACCOUNT_TOKEN,
    },
  });
  const data = await response.json();
  return data;
};

export const verifyDKIM = async (domain_id) => {
  const response = await fetch(`https://api.postmarkapp.com/domains/${domain_id}/verifyDkim`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "X-Postmark-Account-Token": process.env.POSTMARK_ACCOUNT_TOKEN,
    },
  });
  const data = await response.json();
  return data;
};

export const verifyReturnPath = async (domain_id) => {
  const response = await fetch(`https://api.postmarkapp.com/domains/${domain_id}/verifyReturnPath`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "X-Postmark-Account-Token": process.env.POSTMARK_ACCOUNT_TOKEN,
    },
  });
  const data = await response.json();
  return data;
};

export const verifyCNAME = async (domain, expected_value) => {
  try {
    const addresses = await dnsPromises.resolveCname(domain);
    const verified = addresses.includes(expected_value);
    return {
      verified,
    };
  } catch (error) {
    return {
      verified: false,
    };
  }
};
