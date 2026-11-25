const TIME_ZONE = "Asia/Jakarta";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const partsOf = (value: Date | number | string) => {
  const found: Record<string, string> = {};
  for (const part of parts.formatToParts(new Date(value))) {
    found[part.type] = part.value;
  }
  return found;
};

const dayMonth = (found: Record<string, string>) =>
  `${found.day} ${MONTHS[Number(found.month) - 1]}`;

export const formatDayMonth = (value: Date | number | string) =>
  dayMonth(partsOf(value));

export const formatDate = (value: Date | number | string) => {
  const found = partsOf(value);
  return `${dayMonth(found)} ${found.year}`;
};

export const formatTime = (value: Date | number | string) => {
  const found = partsOf(value);
  return `${found.hour}:${found.minute}:${found.second}`;
};

export const formatDateTime = (value: Date | number | string) =>
  `${formatDate(value)} ${formatTime(value)}`;

export const formatShortDateTime = (value: Date | number | string) => {
  const found = partsOf(value);
  return `${dayMonth(found)} ${found.hour}:${found.minute}`;
};
