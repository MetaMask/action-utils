# @metamask/action-utils

Utilities for MetaMask's GitHub Actions.

## Installation

`yarn add @metamask/action-utils`

or

`npm install @metamask/action-utils`

## Usage

For example:

```typescript
import {
  getPackageManifest,
  validatePackageManifestVersion,
} from '@metamask/action-utils';

// Partial<PackageManifest>
const rawManifest = await getPackageManifest('directory/package.json');

// Partial<PackageManifest> & { version: string }
// The version must be valid SemVer, or the function will throw.
// The manifest is returned unmodified.
const manifestWithVersion = await validatePackageManifestVersion(
  rawManifest,
  'directory',
);
```

For more examples of how these utilities are used, see:

- [MetaMask/action-publish-release](https://github.com/MetaMask/action-publish-release)
- [MetaMask/action-create-release-pr](https://github.com/MetaMask/action-create-release-pr)

## Testing

Run `yarn test` to run the tests once.

To run tests on file changes, run `yarn test:watch`.

## Release & Publishing

The project follows the same release process as the other libraries in the MetaMask organization:

1. Create a release branch
   - For a typical release, this would be based on `main`
   - To update an older maintained major version, base the release branch on the major version branch (e.g. `1.x`)
2. Update the changelog
3. Update version in package.json file (e.g. `yarn version --minor --no-git-tag-version`)
4. Create a pull request targeting the base branch (e.g. master or 1.x)
5. Code review and QA
6. Once approved, the PR is squashed & merged
7. The commit on the base branch is tagged
8. The tag can be published as needed
