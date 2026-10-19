const sentencePattern = /[^.!?…\n]+[.!?…]*/g;
export const splitSentences = (message) => {
    const segments = [];
    for (const match of message.matchAll(sentencePattern)) {
        const raw = match[0];
        const text = raw.trim();
        if (text.length > 0) {
            const start = (match.index ?? 0) + raw.indexOf(text);
            segments.push({ start, end: start + text.length });
        }
    }
    return segments;
};
export const sentenceStrategy = (message) => Promise.resolve(splitSentences(message));
