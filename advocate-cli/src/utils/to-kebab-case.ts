export function toKebabCase(input: string): string {
  return input.replace(/\s+/g, '-').toLowerCase();
}
