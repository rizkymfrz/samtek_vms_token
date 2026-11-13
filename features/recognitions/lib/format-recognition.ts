const TIME_ZONE = "Asia/Jakarta";

const time = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const date = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
});

const fullDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const formatTime = (value: Date) => time.format(value);
export const formatDate = (value: Date) => date.format(value);

export const formatDateTime = (value: Date) =>
  `${fullDate.format(value)} ${time.format(value)}`;
