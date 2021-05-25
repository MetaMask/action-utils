import * as fileUtils from './file-utils';
import {
  getPackageManifest,
  ManifestFieldNames,
  validateMonorepoPackageManifest,
  validatePackageManifestName,
  validatePackageManifestVersion,
} from './package-utils';

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
