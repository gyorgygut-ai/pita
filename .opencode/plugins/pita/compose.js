export const composeReply = (message, segments, selected) => {
    const quoted = selected.map((index) => `"${message.slice(segments[index].start, segments[index].end)}"`);
    return quoted.join("\n\n\n");
};
