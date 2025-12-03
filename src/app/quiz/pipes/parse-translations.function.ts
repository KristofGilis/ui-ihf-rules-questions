export function parseTranslations(input: string | Record<string, string> | null | undefined): Record<string, string> {
  if (!input) return {};
  if (typeof input === 'object') return input;
  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}
