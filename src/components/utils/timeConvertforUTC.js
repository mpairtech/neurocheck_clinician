// timeConvertforUTC.js

export const convertToUTC = (dateTimeLocal, timezone) => {
  const [datePart, timePart] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const naiveUTC = Date.UTC(year, month - 1, day, hour, minute, 0);

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

  const parts = formatter.formatToParts(new Date(naiveUTC));
  const get = (type) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  let localHour = get("hour");
  if (localHour === 24) localHour = 0;

  const localShownMs = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    localHour,
    get("minute"),
    get("second"),
  );

  const offset = localShownMs - naiveUTC;
  const actualUTC = new Date(naiveUTC - offset);

  return actualUTC.toISOString();
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
