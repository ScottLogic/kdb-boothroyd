export function replaceAtIndex<T>(array: T[], item: T, index: number) {
  return Object.assign([], array, { [index]: item });
}

export function removeAtIndex<T>(array: T[], index: number) {
  return array.filter((_, i) => i !== index);
}