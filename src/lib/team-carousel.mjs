export function wrapMember(index, count) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

export function memberOffset(index, selected, count) {
  const distance = wrapMember(index - selected, count);
  return distance > count / 2 ? distance - count : distance;
}
