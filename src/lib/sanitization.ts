const TAG_PATTERN = /<[^>]*>/g;
const MULTI_WHITESPACE_PATTERN = /\s+/g;

export function sanitizeInput(input: string): string {
  return input
    .replace(TAG_PATTERN, " ")
    .replace(MULTI_WHITESPACE_PATTERN, " ")
    .trim();
}
