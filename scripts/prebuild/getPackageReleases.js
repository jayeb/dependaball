import _ from 'lodash';
import fetch from 'node-fetch';
import semver from 'semver';

const BASE_URL = 'https://registry.npmjs.org';

const getPackageReleases = async (packageName) => {
  let data;

  try {
    const response = await fetch(`${BASE_URL}/${packageName}`);

    data = await response.json();

    if ('error' in data) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error(`Failed to fetch releases for ${packageName}`, error);

    throw new Error();
  }

  const allReleases = [];

  _.each(data.time, (dateString, version) => {
    if (semver.valid(version) && !semver.prerelease(version)) {
      allReleases.push({
        packageName,
        version,
        timestamp: Date.parse(dateString),
        // This value will be updated once we've sorted the whole list
        bump: 'initial',
      });
    }
  });

  // If NPM is having a bad day we may end up with an empty array
  if (!allReleases.length) {
    return [];
  }

  // We only care about monotonically increasing version numbers
  const incrementalReleases = [];

  _.sortBy(allReleases, 'timestamp').reduce((previousRelease, release) => {
    // If there's no previous, this is the initial release
    if (!previousRelease) {
      incrementalReleases.push(release);
      return release;
    }

    // Determine if this version is an increment
    const isIncrement = semver.gt(release.version, previousRelease.version);

    if (!isIncrement) {
      // We don't care about non-incrementing versions. Onward!
      return previousRelease;
    }

    if (semver.major(release.version) > semver.major(previousRelease.version)) {
      release.bump = 'major';
    } else if (semver.minor(release.version) > semver.minor(previousRelease.version)) {
      release.bump = 'minor';
    } else {
      release.bump = 'patch';
    }

    incrementalReleases.push(release);
    return release;
  }, null);

  return incrementalReleases;
}

export default getPackageReleases;
