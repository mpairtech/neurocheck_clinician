export const convertToUTC = (dateTimeLocal, timezone) => {
  // dateTimeLocal = "2026-04-06T19:17" — user যা input করেছে
  // এটাকে ওই timezone এর local time হিসেবে treat করে UTC বের করতে হবে

  // Step 1: input string কে ওই timezone এর local time হিসেবে
  // UTC এ convert করো — Intl API দিয়ে
  const [datePart, timePart] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Step 2: Binary search / iteration দিয়ে সঠিক UTC খোঁজো
  // আমরা জানতে চাই: কোন UTC moment এ ওই timezone এ clock দেখাবে year/month/day hour:minute?

  // প্রথমে একটা approximate UTC বানাও
  let approxUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Step 3: ওই approximate UTC তে timezone এ কত দেখাচ্ছে সেটা বের করো
  const getLocalParts = (utcDate) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(utcDate);
    const get = (type) =>
      Number(parts.find((p) => p.type === type)?.value ?? "0");

    let h = get("hour");
    if (h === 24) h = 0;

    return Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      h,
      get("minute"),
      get("second"),
    );
  };

  // Step 4: offset বের করো — সঠিক direction এ
  // localShown = approxUTC কে timezone এ দেখালে কত
  const localShown = getLocalParts(approxUTC);

  // target = user যা চেয়েছে সেটা UTC এ (naive)
  const target = Date.UTC(year, month - 1, day, hour, minute);

  // offset = localShown - approxUTC
  // BST: localShown = approxUTC + 3600000, so offset = +3600000
  const offset = localShown - approxUTC.getTime();

  // Step 5: actual UTC = target - offset
  // BST: 19:17 - (+1hr) = 18:17 UTC ✅
  return new Date(target - offset).toISOString();
};

export const formatLondonTime = (utcString) => {
  return new Date(utcString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Europe/London",
  });
};

export const getLondonOffset = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "Unknown";
};
