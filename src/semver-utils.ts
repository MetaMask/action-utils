import semverParse from 'semver/functions/parse';
import type { ReleaseType as SemverReleaseType } from 'semver';

export enum SemverReleaseTypes {
  Major = 'major',
  Premajor = 'premajor',
  Minor = 'minor',
  Preminor = 'preminor',
  Patch = 'patch',
  Prepatch = 'prepatch',
  Prerelease = 'prerelease',
}

/**
 * Checks whether the given value is a valid, unprefixed SemVer version string.
 * The string must begin with the numerical major version.
 *
 * (The semver package has a similar function, but it permits v-prefixes.)
 *
 * @param value - The value to check.
 * @returns Whether the given value is a valid, unprefixed SemVer version
 * string.
 */
export function isValidSemver(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  return semverParse(value, { loose: false })?.version === value;
}

/**
 * Checks whether the given SemVer diff is a major diff, i.e. "major" or
 * "premajor".
 *
 * @param diff - The SemVer diff to check.
 * @returns Whether the given SemVer diff is a major diff.
 */
export function isMajorSemverDiff(diff: SemverReleaseType): boolean {
  return diff.includes(SemverReleaseTypes.Major);
}
