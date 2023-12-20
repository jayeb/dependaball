import { promises as fs } from 'fs';
import _each from 'lodash/each';
import _map from 'lodash/map';
import _orderBy from 'lodash/orderBy';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link'
import path from 'path';

import Divider from '@/components/Divider/Divider';
import DraftPoolHeader from '@/components/DraftPoolHeader/DraftPoolHeader';
import PackageScorecard from '@/components/PackageScorecard/PackageScorecard';
import styles from '@/styles/draft-pool.module.css';
import defaultPointValues from '@/utils/defaultPointValues';
import loadSeasonData from '@/utils/loadSeasonData';
import type {
  PackageData,
  PackageDataMap,
  PackageRelease,
  SeasonPointValues,
} from '@/utils/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

const DAY_DURATION = (24 * 60 * 60 * 1000);

type DraftPoolPageProps = {
  packages: PackageDataMap;
  pointValues: SeasonPointValues;
  startTimestamp: number;
  endTimestamp: number;
}

const DraftPoolPage: NextPage<DraftPoolPageProps> = ({
  packages,
  pointValues,
  startTimestamp,
  endTimestamp,
}) => {
  const sortedPackages = _orderBy(packages, ['totalPoints', 'name'], ['desc', 'asc']);
  const dayCount = Math.round((endTimestamp - startTimestamp) / DAY_DURATION);

  return (
    <>
      <Head>
        <title>Draft Pool</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏉</text></svg>" />
      </Head>

      <DraftPoolHeader dayCount={dayCount} />

      <Divider className={styles.divider} />

      <section>
        <header>
          <h2>{sortedPackages.length} Packages</h2>
        </header>

        {_map(sortedPackages, (packageData) => (
          <PackageScorecard
            key={packageData.name}
            packageData={packageData}
            timestampRange={[startTimestamp, endTimestamp]}
            pointValues={pointValues}
          >
            <p>
              {`Current version: ${packageData.finalVersion}`}
            </p>
          </PackageScorecard>
        ))}
      </section>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [
    { params: { days: '7'}, },
    { params: { days: '30'}, },
    { params: { days: '90'}, },
    { params: { days: '365'}, },
  ],
  fallback: false,
});

export const getStaticProps: GetStaticProps = async (context) => {
  let days = 180;

  if (typeof context.params?.days === 'string') {
    days = parseInt(context.params.days, 10);
  }

  const startTimestamp = Date.now() - (days * DAY_DURATION);
  const endTimestamp = Date.now();

  const currentDependencies: string[] = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, 'remote-dependencies.json'), 'utf8')
  );

  const releasesByPackage: {
    [packageName: string]: PackageRelease[]
  } = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, 'all-releases.json'), 'utf8')
  );

  const packages: PackageDataMap = {};

  _each(currentDependencies, (packageName) => {
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
        totalPoints += defaultPointValues[release.bump];
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

  return {
    props: {
      packages,
      pointValues: defaultPointValues,
      startTimestamp,
      endTimestamp,
    }
  };
};

export default DraftPoolPage;
