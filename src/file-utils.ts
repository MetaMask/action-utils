import { promises as fs } from 'fs';

/**
 * Reads the assumed JSON file at the given path, attempts to parse it, and
 * returns the resulting object.
 *
 * Throws if failing to read or parse, or if the parsed JSON value is not a
 * plain object.
 *
 * @param paths - The path segments pointing to the JSON file. Will be passed
 * to path.join().
 * @returns The object corresponding to the parsed JSON file.
 */
export async function readJsonObjectFile(
  path: string,
): Promise<Record<string, unknown>> {
  const obj = JSON.parse(await fs.readFile(path, 'utf8')) as Record<
    string,
    unknown
  >;

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error(
      `Assumed JSON file at path "${path}" parsed to a non-object value.`,
    );
  }
  return obj;
}

/**
 * Attempts to write the given JSON-like value to the file at the given path.
 * Adds a newline to the end of the file.
 *
 * @param path - The path to write the JSON file to, including the file itself.
 * @param jsonValue - The JSON-like value to write to the file. Make sure that
 * JSON.stringify can handle it.
 */
export async function writeJsonFile(
  path: string,
  jsonValue: unknown,
): Promise<void> {
  await fs.writeFile(path, `${JSON.stringify(jsonValue, null, 2)}\n`);
}
