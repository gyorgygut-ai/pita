export const layoutRuns = (message, segments) => {
  const runs = [];
  let cursor = 0;
  segments.forEach((segment, index) => {
    if (segment.start > cursor) {
      runs.push({
        text: message.slice(cursor, segment.start),
        segment: null
      });
    }
    runs.push({
      text: message.slice(segment.start, segment.end),
      segment: index
    });
    cursor = segment.end;
  });
  if (cursor < message.length) {
    runs.push({
      text: message.slice(cursor),
      segment: null
    });
  }
  return runs;
};