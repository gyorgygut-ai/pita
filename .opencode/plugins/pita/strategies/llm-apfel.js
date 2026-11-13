export const segmentPrompt = message => ["Split the message below into logical segments a reader may quote.", "Answer with the segments only, one per line, copied verbatim from the message.", "Do not number them, do not add quotation marks, do not add any other text.", "Message:", "", message].join("\n");
export const mapDecision = (message, decision) => {
  const segments = [];
  let cursor = 0;
  for (const line of decision.split("\n")) {
    const text = line.trim();
    if (text.length === 0) {
      continue;
    }
    const start = message.indexOf(text, cursor);
    if (start < 0) {
      continue;
    }
    segments.push({
      start,
      end: start + text.length
    });
    cursor = start + text.length;
  }
  return segments;
};
export const parseApfelOutput = stdout => {
  const envelope = JSON.parse(stdout);
  return envelope.content ?? "";
};
export const apfelStrategy = runApfel => message => runApfel(segmentPrompt(message)).then(stdout => mapDecision(message, parseApfelOutput(stdout)));