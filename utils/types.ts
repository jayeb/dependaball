export type Bump = 'initial' | 'major' | 'minor' | 'patch';

export type PackageData = {
  name: string;
  initialVersion: string;
  finalVersion: string;
  releases: PackageRelease[];
  totalPoints: number;
}

export type PackageDataMap = {
  [packageName: string]: PackageData;
}

export type PackageRelease = {
  packageName: string;
  version: string;
  timestamp: number;
  bump: Bump;
}

export type PlayerJson = {
  name: string;
  photo: string;
  active: boolean;
}[];

export type PlayerData = {
  id: string;
  name: string;
  photo: string;
  active: boolean;
}

export type SeasonPlayerData = PlayerData & {
  draftOrder: number;
  packages: PackageData[];
  releases: PackageRelease[];
  totalPoints: number;
  tiebreakerValue: number;
}

export type SeasonPointValues = {
  major: number;
  minor: number;
  patch: number;
}

export type SeasonJson = {
  name: string;
  pointValues: SeasonPointValues;
  start: string;
  end: string;
  players: Array<{
    name: string;
    draftees: string[];
  }>;
  draftPool: string[];
}

export type SeasonData = {
  id: string;
  name: string;
  startTimestamp: number;
  endTimestamp: number;
  isStarted: boolean;
  isEnded: boolean;
  pointValues: SeasonPointValues;
  packages: PackageDataMap;
  players: SeasonPlayerData[];
}
