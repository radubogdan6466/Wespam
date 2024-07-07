import Filter from "bad-words";

const filter = new Filter();

const forbiddenCharacters = [
  "{",
  "}",
  "<",
  ">",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "[",
  "]",
  "\\",
  "|",
  '"',
  "/",
  "~",
];

export function validateMessage(message) {
  if (!message) {
    return { valid: false, error: "Message is empty. Please type a message." };
  }

  if (message.length > 100) {
    return {
      valid: false,
      error: "Message exceeds 100 characters limit.",
    };
  }

  if (filter.isProfane(message)) {
    return {
      valid: false,
      error: "Message contains inappropriate language.",
    };
  }

  for (const char of forbiddenCharacters) {
    if (message.includes(char)) {
      return {
        valid: false,
        error: "Message contains forbidden characters.",
      };
    }
  }

  return { valid: true, error: "" };
}
