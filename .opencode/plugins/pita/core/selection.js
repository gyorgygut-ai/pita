export const nextIndex = (current, count) => {
  if (count <= 0) {
    return -1;
  }
  return current < 0 ? 0 : (current + 1) % count;
};
export const prevIndex = (current, count) => {
  if (count <= 0) {
    return -1;
  }
  return current < 0 ? count - 1 : (current - 1 + count) % count;
};
export const isSelected = (selected, index) => selected.includes(index);
export const toggleSelected = (selected, index) => isSelected(selected, index) ? selected.filter(item => item !== index) : [...selected, index].sort((left, right) => left - right);