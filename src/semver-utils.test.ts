import { isMajorSemverDiff, isValidSemver } from './semver-utils';

describe('isValidSemver', () => {
  it('returns true for clean SemVer version strings', () => {
    expect(isValidSemver('0.0.1')).toStrictEqual(true);
    expect(isValidSemver('0.1.0')).toStrictEqual(true);
    expect(isValidSemver('1.0.0')).toStrictEqual(true);
    expect(isValidSemver('1.0.1')).toStrictEqual(true);
    expect(isValidSemver('1.1.0')).toStrictEqual(true);
    expect(isValidSemver('1.1.1')).toStrictEqual(true);
    expect(isValidSemver('1.0.0-0')).toStrictEqual(true);
    expect(isValidSemver('1.0.0-beta')).toStrictEqual(true);
    expect(isValidSemver('1.0.0-beta1')).toStrictEqual(true);
    expect(isValidSemver('1.0.0-beta.1')).toStrictEqual(true);
  });

  it('returns false for non-string values', () => {
    expect(isValidSemver(null)).toStrictEqual(false);
  });

  it('returns false for v-prefixed SemVer strings', () => {
    expect(isValidSemver('v1.0.0')).toStrictEqual(false);
  });
});

describe('isMajorSemverDiff', () => {
  it('returns true for "major" and "premajor" diffs', () => {
    expect(isMajorSemverDiff('major')).toStrictEqual(true);
    expect(isMajorSemverDiff('premajor')).toStrictEqual(true);
  });

  it('returns false for non-major diffs', () => {
    expect(isMajorSemverDiff('patch')).toStrictEqual(false);
    expect(isMajorSemverDiff('minor')).toStrictEqual(false);
    expect(isMajorSemverDiff('prerelease')).toStrictEqual(false);
  });
});
