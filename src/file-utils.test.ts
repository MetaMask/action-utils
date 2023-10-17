import fs from 'fs';
import { readJsonObjectFile, writeJsonFile } from './file-utils';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('readJsonObjectFile', () => {
  it('reads a JSON file and returns it as an object', async () => {
    const expectedResult = { foo: ['bar', 'baz'] };
    const path = 'arbitrary/path';
    const mockJsonString = JSON.stringify(expectedResult);

    jest
      .spyOn(fs.promises, 'readFile')
      .mockImplementationOnce(async () => mockJsonString);

    const result = await readJsonObjectFile(path);
    expect(result).toStrictEqual(expectedResult);
  });

  it('throws an error if the file contains invalid JSON', async () => {
    const path = 'arbitrary/path';
    // missing closing curly bracket
    const mockJsonString = `{ foo: ['bar', 'baz']`;

    jest
      .spyOn(fs.promises, 'readFile')
      .mockImplementationOnce(async () => mockJsonString);

    await expect(readJsonObjectFile(path)).rejects.toThrow(
      /^Unexpected token|^Expected property name/u,
    );
  });

  it('throws an error if the file parses to a non-object value', async () => {
    const path = 'arbitrary/path';
    const readFileMock = jest.spyOn(fs.promises, 'readFile');
    const badJsonValues = ['null', '[]', '"foobar"', 'true', 'false', '2'];

    for (const badValue of badJsonValues) {
      readFileMock.mockImplementationOnce(async () => badValue);
      await expect(readJsonObjectFile(path)).rejects.toThrow(
        /non-object value\.$/u,
      );
    }
  });
});

describe('writeJsonFile', () => {
  const stringify = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

  it('stringifies a JSON-like value and writes it to disk', async () => {
    const jsonValue = { foo: ['bar', 'baz'] };
    const path = 'arbitrary/path';

    const writeFileSpy = jest.spyOn(fs.promises, 'writeFile');

    await writeJsonFile(path, jsonValue);
    expect(writeFileSpy).toHaveBeenCalledTimes(1);
    expect(writeFileSpy).toHaveBeenCalledWith(path, stringify(jsonValue));
  });
});
