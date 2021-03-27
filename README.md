# GitHub Actions Installer

[![Build](https://github.com/jbrunton/gha-installer/workflows/build/badge.svg?branch=develop)](https://github.com/jbrunton/gha-installer/actions?query=branch%3Adevelop+workflow%3Abuild)
[![Examples](https://github.com/jbrunton/gha-installer/workflows/examples/badge.svg?branch=develop)](https://github.com/jbrunton/gha-installer/actions?query=workflow%3Aexamples)
[![Maintainability](https://api.codeclimate.com/v1/badges/3d363eb022777f5a6a1e/maintainability)](https://codeclimate.com/github/jbrunton/gha-installer/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3d363eb022777f5a6a1e/test_coverage)](https://codeclimate.com/github/jbrunton/gha-installer/test_coverage)

Utility classes for creating GitHub actions for downloading and caching binary files. It provides a couple of specific conveniences:

1. An `Installer` class which, when given an app description (i.e. name + version), will check the GitHub tools cache and if necessary download the binary.
2. A `GitHubReleasesService` class which knows how to query the GitHub API for latest versions ordered by semantic version number. This is important, because if you simply check the `latest` release (according to the GitHub API) in your actions and then patch an older version, users will be given the patch for your older version.

## Usage

Add to your project:

```
npm install @jbrunton/gha-installer
```

For how to use the library, see the example actions:

* [single-app](https://github.com/jbrunton/gha-installer/tree/develop/examples/single-app) - shows how to install a single app on Linux.
* [multi-app](https://github.com/jbrunton/gha-installer/tree/develop/examples/multi-app) - a more complex example that shows how to install multiple apps with different binaries on different platforms.

And in actions available on the GitHub Marketplace:

* [jbrunton/setup-gflows](https://github.com/jbrunton/setup-gflows) - installs a single app on Linux or Mac.
* [vmware-tanzu/carvel-setup-action](https://github.com/vmware-tanzu/carvel-setup-action) - installs multiple apps on different platforms.
