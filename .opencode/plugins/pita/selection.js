export const nextIndex = (current, count) => {
    if (count === 0) {
        return -1;
    }
    if (current < 0) {
        return 0;
    }
    return (current + 1) % count;
};
export const prevIndex = (current, count) => {
    if (count === 0) {
        return -1;
    }
    if (current < 0) {
        return count - 1;
    }
    return (current - 1 + count) % count;
};
export const toggleSelected = (selected, index) => {
    if (selected.includes(index)) {
        return selected.filter((value) => value !== index);
    }
    return [...selected, index].sort((left, right) => left - right);
};
export const isSelected = (selected, index) => selected.includes(index);
