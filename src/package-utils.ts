import pathUtils from 'path';
import { promisify } from 'util';
import _glob from 'glob';
import { isTruthyString } from './misc-utils';
import { readJsonObjectFile } from './file-utils';
import { isValidSemver } from './semver-utils';

const glob = promisify(_glob);

const PACKAGE_JSON = 'package.json';

export enum ManifestDependencyFieldNames {
  Production = 'dependencies',
  Development = 'devDependencies',
  Peer = 'peerDependencies',
  Bundled = 'bundledDependencies',
  Optional = 'optionalDependencies',
}

export enum ManifestFieldNames {
  Engines = 'engines',
  Name = 'name',
  Private = 'private',
  Version = 'version',
  Workspaces = 'workspaces',
}

export enum EngineNames {
  Node = 'node',
  Npm = 'npm',
  Pnpm = 'pnpm',
  Yarn = 'yarn',
}

export interface PackageManifest
  extends Partial<
    Record<ManifestDependencyFieldNames, Record<string, string>>
  > {
  readonly [ManifestFieldNames.Engines]?: { [name in EngineNames]?: string };
  readonly [ManifestFieldNames.Name]: string;
  readonly [ManifestFieldNames.Private]?: boolean;
  readonly [ManifestFieldNames.Version]: string;
  readonly [ManifestFieldNames.Workspaces]?: string[];
}

export interface PolyrepoPackageManifest
  extends Partial<
    Record<ManifestDependencyFieldNames, Record<string, string>>
  > {
  readonly [ManifestFieldNames.Engines]?: { [name in EngineNames]?: string };
  readonly [ManifestFieldNames.Name]: string;
  readonly [ManifestFieldNames.Version]: string;
}

export interface MonorepoPackageManifest extends Partial<PackageManifest> {
  readonly [ManifestFieldNames.Engines]?: { [name in EngineNames]?: string };
  readonly [ManifestFieldNames.Private]: boolean;
  readonly [ManifestFieldNames.Version]: string;
  readonly [ManifestFieldNames.Workspaces]: string[];
}

/**
 * Read, parse, validate, and return the object corresponding to the
 * package.json file in the given directory.
 *
 * An error is thrown if validation fails.
 *
 * @param containingDirPath - The complete path to the directory containing
 * the package.json file.
 * @returns The object corresponding to the parsed package.json file.
 */
export async function getPackageManifest(
  containingDirPath: string,
): Promise<Record<string, unknown>> {
  return await readJsonObjectFile(
    pathUtils.join(containingDirPath, PACKAGE_JSON),
  );
}

/**
 * Type guard to ensure that the given manifest has a valid "name" field.
 *
 * @param manifest - The manifest object to validate.
 * @returns Whether the manifest has a valid "name" field.
 */
function hasValidNameField(
  manifest: Partial<PackageManifest>,
): manifest is typeof manifest &
  Pick<PackageManifest, ManifestFieldNames.Name> {
  return isTruthyString(manifest[ManifestFieldNames.Name]);
}

/**
 * Type guard to ensure that the given manifest has a valid "private" field.
 *
 * @param manifest - The manifest object to validate.
 * @returns Whether the manifest has a valid "private" field.
 */
function hasValidPrivateField(
  manifest: Partial<PackageManifest>,
): manifest is typeof manifest &
  Pick<MonorepoPackageManifest, ManifestFieldNames.Private> {
  return manifest[ManifestFieldNames.Private] === true;
}

/**
 * Type guard to ensure that the given manifest has a valid "version" field.
 *
 * @param manifest - The manifest object to validate.
 * @returns Whether the manifest has a valid "version" field.
 */
function hasValidVersionField(
  manifest: Partial<PackageManifest>,
): manifest is typeof manifest &
  Pick<PackageManifest, ManifestFieldNames.Version> {
  return isValidSemver(manifest[ManifestFieldNames.Version]);
}

/**
 * Type guard to ensure that the given manifest has a valid "worksapces" field.
 *
 * @param manifest - The manifest object to validate.
 * @returns Whether the manifest has a valid "worksapces" field.
 */
function hasValidWorkspacesField(
  manifest: Partial<PackageManifest>,
): manifest is typeof manifest &
  Pick<MonorepoPackageManifest, ManifestFieldNames.Workspaces> {
  return (
    Array.isArray(manifest[ManifestFieldNames.Workspaces]) &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    manifest[ManifestFieldNames.Workspaces]!.length > 0
  );
}

/**
 * Validates the "version" field of a package manifest object, i.e. a parsed
 * "package.json" file.
 *
 * @param manifest - The manifest to validate.
 * @param manifestDirPath - The path to the directory containing the
 * manifest file relative to the root directory.
 * @returns The unmodified manifest, with the "version" field typed correctly.
 */
export function validatePackageManifestVersion<
  ManifestType extends Partial<PackageManifest>
>(
  manifest: ManifestType,
  manifestDirPath: string,
): ManifestType & Pick<PackageManifest, ManifestFieldNames.Version> {
  if (!hasValidVersionField(manifest)) {
    throw new Error(
      `${getManifestErrorMessagePrefix(
        ManifestFieldNames.Version,
        manifest,
        manifestDirPath,
      )} is not a valid SemVer version: ${
        manifest[ManifestFieldNames.Version]
      }`,
    );
  }
  return manifest;
}

/**
 * Validates the "name" field of a package manifest object, i.e. a parsed
 * "package.json" file.
 *
 * @param manifest - The manifest to validate.
 * @param manifestDirPath - The path to the directory containing the
 * manifest file relative to the root directory.
 * @returns The unmodified manifest, with the "name" field typed correctly.
 */
export function validatePackageManifestName<
  ManifestType extends Partial<PackageManifest>
>(
  manifest: ManifestType,
  manifestDirPath: string,
): ManifestType & Pick<PackageManifest, ManifestFieldNames.Name> {
  if (!hasValidNameField(manifest)) {
    throw new Error(
      `Manifest in "${manifestDirPath}" does not have a valid "${ManifestFieldNames.Name}" field.`,
    );
  }
  return manifest;
}

/**
 * Validates the "version" and "name" fields of a package manifest object,
 * i.e. a parsed "package.json" file.
 *
 * @param manifest - The manifest to validate.
 * @param manifestDirPath - The path to the directory containing the
 * manifest file relative to the root directory.
 * @returns The unmodified manifest, with the "version" and "name" fields typed
 * correctly.
 */
export function validatePolyrepoPackageManifest(
  manifest: Partial<PackageManifest>,
  manifestDirPath: string,
): PolyrepoPackageManifest {
  return validatePackageManifestName(
    validatePackageManifestVersion(manifest, manifestDirPath),
    manifestDirPath,
  );
}

/**
 * Validates the "workspaces" and "private" fields of a package manifest object,
 * i.e. a parsed "package.json" file.
 *
 * Assumes that the manifest's "version" field is already validated.
 *
 * @param manifest - The manifest to validate.
 * @param manifestDirPath - The path to the directory containing the
 * manifest file relative to the root directory.
 * @returns The unmodified manifest, with the "workspaces" and "private" fields
 * typed correctly.
 */
export function validateMonorepoPackageManifest<
  ManifestType extends Pick<PackageManifest, ManifestFieldNames.Version> &
    Partial<PackageManifest>
>(manifest: ManifestType, manifestDirPath: string): MonorepoPackageManifest {
  if (!hasValidWorkspacesField(manifest)) {
    throw new Error(
      `${getManifestErrorMessagePrefix(
        ManifestFieldNames.Workspaces,
        manifest,
        manifestDirPath,
      )} must be a non-empty array if present. Received: ${
        manifest[ManifestFieldNames.Workspaces]
      }`,
    );
  }

  if (!hasValidPrivateField(manifest)) {
    throw new Error(
      `${getManifestErrorMessagePrefix(
        ManifestFieldNames.Private,
        manifest,
        manifestDirPath,
      )} must be "true" if "${
        ManifestFieldNames.Workspaces
      }" is present. Received: ${manifest[ManifestFieldNames.Private]}`,
    );
  }
  return manifest;
}

/**
 * Gets the prefix of an error message for a manifest file validation error.
 *
 * @param invalidField - The name of the invalid field.
 * @param manifest - The manifest object that's invalid.
 * @param manifestDirPath - The path to the directory of the manifest file
 * relative to the root directory.
 * @returns The prefix of a manifest validation error message.
 */
function getManifestErrorMessagePrefix(
  invalidField: ManifestFieldNames,
  manifest: Partial<MonorepoPackageManifest>,
  manifestDirPath: string,
) {
  return `${
    manifest[ManifestFieldNames.Name]
      ? `"${manifest[ManifestFieldNames.Name]}" manifest "${invalidField}"`
      : `"${invalidField}" of manifest in "${manifestDirPath}"`
  }`;
}

/**
 * Get workspace directory locations, given the set of workspace patterns
 * specified in the `workspaces` field of the root `package.json` file.
 *
 * @param workspaces - The list of workspace patterns given in the root manifest.
 * @param rootDir - The monorepo root directory.
 * @param recursive - Whether to search recursively.
 * @returns The location of each workspace directory relative to the root directory
 */
export async function getWorkspaceLocations(
  workspaces: string[],
  rootDir: string,
  recursive = false,
  prefix = '',
): Promise<string[]> {
  const resolvedWorkspaces = await workspaces.reduce<Promise<string[]>>(
    async (promise, pattern) => {
      const array = await promise;
      const matches = (await glob(pattern, { cwd: rootDir })).map((match) =>
        pathUtils.join(prefix, match),
      );

      return [...array, ...matches];
    },
    Promise.resolve([]),
  );

  if (recursive) {
    // This reads all the package JSON files in each workspace, checks if they are a monorepo, and
    // recursively calls `getWorkspaceLocations` if they are.
    const resolvedSubWorkspaces = await resolvedWorkspaces.reduce<
      Promise<string[]>
    >(async (promise, workspacePath) => {
      const array = await promise;

      const rawManifest = await getPackageManifest(workspacePath);
      if (ManifestFieldNames.Workspaces in rawManifest) {
        const manifest = validatePackageManifestVersion(
          rawManifest,
          workspacePath,
        );

        const monorepoManifest = validateMonorepoPackageManifest(
          manifest,
          workspacePath,
        );

        return [
          ...array,
          ...(await getWorkspaceLocations(
            monorepoManifest[ManifestFieldNames.Workspaces],
            workspacePath,
            recursive,
            workspacePath,
          )),
        ];
      }

      return array;
    }, Promise.resolve(resolvedWorkspaces));

    return resolvedSubWorkspaces;
  }

  return resolvedWorkspaces;
}
