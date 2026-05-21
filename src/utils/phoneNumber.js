const COUNTRY_CODE = "234";
const SUBSCRIBER_LENGTH = 10;

export const getNigerianSubscriberDigits = (value = "") => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(COUNTRY_CODE.length);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, SUBSCRIBER_LENGTH);
};

export const formatNigerianPhoneNumber = (value = "") => {
  const digits = getNigerianSubscriberDigits(value);

  if (!digits) {
    return "";
  }

  const firstGroup = digits.slice(0, 3);
  const secondGroup = digits.slice(3, 6);
  const thirdGroup = digits.slice(6);

  return [`+${COUNTRY_CODE}`, firstGroup, secondGroup, thirdGroup]
    .filter(Boolean)
    .join(" ");
};

export const normalizeNigerianPhoneNumber = (value = "") => {
  const digits = getNigerianSubscriberDigits(value);

  return digits ? `+${COUNTRY_CODE}${digits}` : "";
};

export const isValidNigerianPhoneNumber = (value = "") =>
  /^[789]\d{9}$/.test(getNigerianSubscriberDigits(value));
