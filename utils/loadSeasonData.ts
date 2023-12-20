import { promises as fs } from 'fs';
import _each from 'lodash/each';
import _orderBy from 'lodash/orderBy';
import path from 'path';

import getTiebreakerValue from '@/utils/getTiebreakerValue';
import loadPlayersData from '@/utils/loadPlayersData';
import sortPlayers from '@/utils/sortPlayers';
import type {
  PackageData,
  PackageDataMap,
  PackageRelease,
  SeasonData,
  SeasonJson,
  SeasonPlayerData,
} from '@/utils/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

export default async function loadSeasonData(seasonID: string): Promise<SeasonData> {
  const filePath = path.join(SEASONS_DIR, `${seasonID}.json`);
  const fileContents = await fs.readFile(filePath, 'utf8');

  let seasonData: SeasonJson;

  try {
    seasonData = JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Could not load season file: ${error}`);
  }

  const playersData = await loadPlayersData();

  const releasesByPackage: {
    [packageName: string]: PackageRelease[]
  } = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, 'all-releases.json'), 'utf8')
  );

  const startTimestamp = Date.parse(seasonData.start);
  const endTimestamp = Date.parse(seasonData.end);

  const isStarted = Date.now() >= startTimestamp;
  const isEnded = Date.now() >= endTimestamp;

  const packages: PackageDataMap = {};

  _each(seasonData.draftPool, (packageName) => {
    let initialVersion = '';
    let finalVersion = '';
    let totalPoints = 0;

    const filteredReleases: PackageRelease[] = [];

    releasesByPackage[packageName].forEach((release) => {
      if (release.timestamp < startTimestamp) {
        initialVersion = release.version;
        finalVersion = release.version;
        return;
      }

      if (release.timestamp > endTimestamp) {
        return;
      }

      finalVersion = release.version;
      filteredReleases.push(release);

      if (release.bump !== 'initial') {
        totalPoints += seasonData.pointValues[release.bump];
      }
    });

    packages[packageName] = {
      name: packageName,
      initialVersion,
      finalVersion,
      releases: filteredReleases,
      totalPoints,
    };
  });

  const players: SeasonPlayerData[] = seasonData.players.map(({name, draftees}, index) => {
    const playerData = playersData.find((player) => player.name === name);

    if (!playerData) {
      throw new Error(`Could not find player data for ${name}`);
    }

    let totalPoints = 0;

    const playerPackages: PackageData[] = draftees.map((packageName) => {
      const packageData = packages[packageName];

      totalPoints += packageData.totalPoints;

      return packageData;
    });

    const playerReleases: PackageRelease[] = _orderBy(
      playerPackages.flatMap((packageData) => packageData.releases),
      ['timestamp', 'name'],
      ['asc', 'asc']
    );

    return {
      ...playerData,
      draftOrder: index + 1,
      packages: playerPackages,
      releases: playerReleases,
      totalPoints,
      tiebreakerValue: getTiebreakerValue(playerPackages),
    }
  });

  return {
    id: seasonID,
    name: seasonData.name,
    startTimestamp,
    endTimestamp,
    isStarted,
    isEnded,
    pointValues: seasonData.pointValues,
    packages,
    players,
  };
}
