const TWO_SPACES = '  ';

/**
 * Utility function to get the value of a key from an object known to only
 * contain string values, such as process.env.
 *
 * Trims the value before returning it, and returns the empty string for any
 * undefined values.
 *
 * @param key - The key of process.env to access.
 * @returns The trimmed string value of the process.env key. Returns an empty
 * string if the key is not set.
 */
export function getStringRecordValue(
  key: string,
  object: Partial<Record<string, string>>,
): string {
  return object[key]?.trim() || '';
}

/**
 * @param value - The value to test.
 * @returns Whether the value is a non-empty string.
 */
export function isTruthyString(value: unknown): value is string {
  return Boolean(value) && typeof value === 'string';
}

/**
 * @param numTabs - The number of tabs to return. A tab consists of two spaces.
 * @param prefix - The prefix to prepend to the returned string, if any.
 * @returns A string consisting of the prefix, if any, and the requested number
 * of tabs.
 */
export function tabs(numTabs: number, prefix?: string): string {
  if (!Number.isInteger(numTabs) || numTabs < 1) {
    throw new Error('Expected positive integer.');
  }

  const firstTab = prefix ? `${prefix}${TWO_SPACES}` : TWO_SPACES;

  if (numTabs === 1) {
    return firstTab;
  }
  return firstTab + new Array(numTabs).join(TWO_SPACES);
}
