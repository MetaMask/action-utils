import { access } from 'fs/promises';
import { glob } from 'glob';

import * as fileUtils from './file-utils';
import {
  getPackageManifest,
  getWorkspaceLocations,
  ManifestFieldNames,
  validateMonorepoPackageManifest,
  validatePackageManifestName,
  validatePackageManifestVersion,
  validatePolyrepoPackageManifest,
} from './package-utils';

jest.mock('glob');
jest.mock('fs/promises');

describe('getPackageManifest', () => {
  let readJsonFileMock: jest.SpyInstance;

  beforeEach(() => {
    readJsonFileMock = jest.spyOn(fileUtils, 'readJsonObjectFile');
  });

  it('gets and returns a manifest file', async () => {
    const manifest = {
      [ManifestFieldNames.Name]: 'fooName',
      [ManifestFieldNames.Version]: '1.0.0',
    };

    readJsonFileMock.mockImplementationOnce(async () => {
      return { ...manifest };
    });

    expect(await getPackageManifest('fooPath')).toStrictEqual(manifest);
  });
});

describe('validatePackageManifestVersion', () => {
  it('passes through a manifest with a valid "version"', async () => {
    const path = 'fooPath';
    const manifest = { [ManifestFieldNames.Version]: '1.0.0' };

    expect(validatePackageManifestVersion(manifest, path)).toStrictEqual({
      ...manifest,
    });
  });

  it('throws if manifest has an invalid "version"', async () => {
    const path = 'fooPath';
    const badVersions: any[] = ['foo', 'v1.0.0', null, true];

    for (const badValue of badVersions) {
      expect(() =>
        validatePackageManifestVersion(
          { [ManifestFieldNames.Version]: badValue },
          path,
        ),
      ).toThrow(/"version"/u);
    }

    // For coverage purposes
    expect(() =>
      validatePackageManifestVersion({ name: 'foo-name' }, path),
    ).toThrow(/"version"/u);
  });
});

describe('validatePackageManifestName', () => {
  it('passes through a manifest with a valid "name"', async () => {
    const path = 'fooPath';
    const manifest = { [ManifestFieldNames.Name]: 'foo-name' };

    expect(validatePackageManifestName(manifest, path)).toStrictEqual({
      ...manifest,
    });
  });

  it('throws if manifest has an invalid "name"', async () => {
    const path = 'fooPath';
    const badNames: any[] = [1, '', null, true];

    for (const badValue of badNames) {
      expect(() =>
        validatePackageManifestName(
          { [ManifestFieldNames.Name]: badValue },
          path,
        ),
      ).toThrow(/"name"/u);
    }
  });
});

describe('validateMonorepoPackageManifest', () => {
  it('passes through a manifest with valid fields', async () => {
    const path = 'fooPath';
    const manifest = {
      [ManifestFieldNames.Private]: true,
      [ManifestFieldNames.Version]: '1.0.0',
      [ManifestFieldNames.Workspaces]: ['a', 'b'],
    };

    expect(validateMonorepoPackageManifest(manifest, path)).toStrictEqual({
      ...manifest,
    });
  });

  it('throws if manifest has invalid fields', async () => {
    const path = 'fooPath';

    let badManifest: any = {
      [ManifestFieldNames.Private]: true,
      [ManifestFieldNames.Version]: '1.0.0',
      [ManifestFieldNames.Workspaces]: [],
    };
    expect(() => validateMonorepoPackageManifest(badManifest, path)).toThrow(
      /"workspaces" .* non-empty array/u,
    );

    badManifest = {
      [ManifestFieldNames.Private]: true,
      [ManifestFieldNames.Version]: '1.0.0',
      [ManifestFieldNames.Workspaces]: 'foo',
    };
    expect(() => validateMonorepoPackageManifest(badManifest, path)).toThrow(
      /"workspaces" .*non-empty array/u,
    );

    badManifest = {
      [ManifestFieldNames.Private]: false,
      [ManifestFieldNames.Version]: '1.0.0',
      [ManifestFieldNames.Workspaces]: ['a', 'b'],
    };
    expect(() => validateMonorepoPackageManifest(badManifest, path)).toThrow(
      /"private" .*"true"/u,
    );

    badManifest = {
      [ManifestFieldNames.Private]: {},
      [ManifestFieldNames.Version]: '1.0.0',
      [ManifestFieldNames.Workspaces]: ['a', 'b'],
    };
    expect(() => validateMonorepoPackageManifest(badManifest, path)).toThrow(
      /"private" .*"true"/u,
    );
  });
});

describe('validatePolyrepoPackageManifest', () => {
  it('passes through a manifest with valid fields', async () => {
    const path = 'fooPath';
    const manifest = {
      [ManifestFieldNames.Name]: 'foo',
      [ManifestFieldNames.Version]: '1.0.0',
    };

    expect(validatePolyrepoPackageManifest(manifest, path)).toStrictEqual({
      ...manifest,
    });
  });
});

describe('getWorkspaceLocations', () => {
  const mockGlob =
    (value: string[]) =>
    (
      _pattern: string,
      _options: unknown,
      callback: (error: null, data: string[]) => void,
    ) =>
      callback(null, value);

  it('does the thing', async () => {
    const workspaces = ['foo/bar', 'fizz/buzz'];
    const rootDir = 'dir';

    (glob as jest.MockedFunction<any>)
      .mockImplementationOnce(mockGlob(['foo/bar']))
      .mockImplementationOnce(mockGlob(['fizz/buzz']));

    (access as jest.MockedFunction<typeof access>).mockResolvedValue();

    expect(await getWorkspaceLocations(workspaces, rootDir)).toStrictEqual(
      workspaces,
    );
  });

  it('does the thing, but recursively', async () => {
    (glob as jest.MockedFunction<any>)
      .mockImplementationOnce(mockGlob(['foo/bar']))
      .mockImplementationOnce(mockGlob(['baz']))
      .mockImplementationOnce(mockGlob(['qux']));

    (access as jest.MockedFunction<typeof access>).mockResolvedValue();

    jest
      .spyOn(fileUtils, 'readJsonObjectFile')
      .mockImplementationOnce(async () => ({
        [ManifestFieldNames.Version]: '1.0.0',
        [ManifestFieldNames.Private]: true,
        [ManifestFieldNames.Workspaces]: ['baz'],
      }))
      .mockImplementationOnce(async () => ({
        [ManifestFieldNames.Version]: '1.0.0',
        [ManifestFieldNames.Private]: true,
        [ManifestFieldNames.Workspaces]: ['qux'],
      }))
      .mockImplementation(async () => ({
        [ManifestFieldNames.Version]: '1.0.0',
      }));

    expect(await getWorkspaceLocations(['foo/bar'], 'dir', true)).toStrictEqual(
      ['foo/bar', 'foo/bar/baz', 'foo/bar/baz/qux'],
    );
  });

  it('filters out workspaces without a package.json', async () => {
    (glob as jest.MockedFunction<any>)
      .mockImplementationOnce(mockGlob(['foo/bar']))
      .mockImplementationOnce(mockGlob(['fizz/buzz']));

    (access as jest.MockedFunction<typeof access>)
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('ENOENT'));

    expect(
      await getWorkspaceLocations(['foo/bar', 'fizz/buzz'], 'dir'),
    ).toStrictEqual(['foo/bar']);
  });
});
