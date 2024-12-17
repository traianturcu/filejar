const isCommonEmailAddress = (email) => {
  const commonEmailProviders = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "aol.com",
    "protonmail.com",
    "gmx.com",
    "yandex.com",
    "zoho.com",
    "me.com",
  ];

  const domain = email.split("@").pop().toLowerCase();

  return commonEmailProviders.includes(domain);
};

export default isCommonEmailAddress;
