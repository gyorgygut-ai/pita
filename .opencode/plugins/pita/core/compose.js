export const composeReply = (message, segments, selected) => {
  const quoted = selected.map(index => `"${message.slice(segments[index].start, segments[index].end)}"`);
  return quoted.length === 0 ? "" : `${quoted.join("\n\n\n")}\n\n\n`;
};
export const quotedRanges = reply => {
  const ranges = [];
  for (const match of reply.matchAll(/"[^"]*"/g)) {
    const start = match.index ?? 0;
    ranges.push({
      start,
      end: start + match[0].length
    });
  }
  return ranges;
};