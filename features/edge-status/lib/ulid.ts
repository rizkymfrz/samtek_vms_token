const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TIME_LENGTH = 10;
const RANDOM_LENGTH = 16;

export const ulid = (now = Date.now()) => {
  let time = "";
  let rest = now;
  for (let i = 0; i < TIME_LENGTH; i++) {
    time = ALPHABET[rest % 32] + time;
    rest = Math.floor(rest / 32);
  }
  const random = crypto.getRandomValues(new Uint8Array(RANDOM_LENGTH));
  return time + Array.from(random, (byte) => ALPHABET[byte % 32]).join("");
};
