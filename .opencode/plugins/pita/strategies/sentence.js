const terminators = ".!?…";
const closers = "\"'”’)]}";
const isWhitespace = value => value === undefined || /\s/.test(value);
const isDigit = value => value >= "0" && value <= "9";
const isListMarker = (message, index) => {
  if (message[index] !== ".") {
    return false;
  }
  let start = index - 1;
  while (start >= 0 && isDigit(message[start])) {
    start--;
  }
  if (start === index - 1) {
    return false;
  }
  return isWhitespace(start < 0 ? undefined : message[start]);
};
export const splitSentences = message => {
  const segments = [];
  const push = (from, to) => {
    const raw = message.slice(from, to);
    const text = raw.trim();
    if (text.length === 0) {
      return;
    }
    const start = from + raw.indexOf(text);
    segments.push({
      start,
      end: start + text.length
    });
  };
  let start = 0;
  let index = 0;
  while (index < message.length) {
    if (!terminators.includes(message[index])) {
      index++;
      continue;
    }
    let end = index;
    while (end + 1 < message.length && terminators.includes(message[end + 1])) {
      end++;
    }
    while (end + 1 < message.length && closers.includes(message[end + 1])) {
      end++;
    }
    if (isWhitespace(message[end + 1]) && !isListMarker(message, index)) {
      push(start, end + 1);
      start = end + 1;
    }
    index = end + 1;
  }
  push(start, message.length);
  return segments;
};
export const sentenceStrategy = message => Promise.resolve(splitSentences(message));