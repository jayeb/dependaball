import { promises as fs } from 'fs';
import _each from 'lodash/each';
import _orderBy from 'lodash/orderBy';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import path from 'path';

import Divider from '@/components/Divider/Divider';
import IndexHeader from '@/components/IndexHeader/IndexHeader';
import SeasonHistoryRow from '@/components/SeasonHistoryRow/SeasonHistoryRow';
import styles from '@/styles/index.module.css';
import defaultPointValues from '@/utils/defaultPointValues';
import loadSeasonData from '@/utils/loadSeasonData';
import type {
  PackageData,
  PackageDataMap,
  PackageRelease,
  SeasonData,
  SeasonPointValues,
} from '@/utils/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

const DAY_DURATION = (24 * 60 * 60 * 1000);

type IndexPageProps = {
  seasons: SeasonData[];
}

const IndexPage: NextPage<IndexPageProps> = ({
  seasons,
}) => {
  const completedSeasons = seasons.filter((season) => season.isEnded);
  const inProgressSeasons = seasons.filter((season) => season.isStarted && ! season.isEnded);

  return (
    <>
      <Head>
        <title>Dependaball</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏉</text></svg>" />
      </Head>

      <IndexHeader inProgressSeasons={inProgressSeasons} />

      <Divider className={styles.divider} />

      <section>
        <header>
          <h2>Past Seasons</h2>
        </header>
        {completedSeasons.map((seasonData) => (
          <SeasonHistoryRow
            key={seasonData.id}
            seasonData={seasonData}
          />
        ))}
      </section>

      <Divider className={styles.divider} />

      <section className={styles.copySection}>
        <header>
          <h2>What is Dependaball?</h2>
        </header>

        <p>
          Dependaball is a fantasy-sporting game developed at Balsa to counteract the crushing despair of trying to keep an increasingly-large stable of technical dependencies up to date. A new version of a dependency should be cause for rejoicing, but when these updates pile up, dealing with them can become a real chore. So to bring back some of the joy of dependency updates, we decided to make a game of it!
        </p>

        <p>
          Every month we kick off a new season of Dependaball by sitting down together and drafting our favorite dependencies from our monorepo's `package.json` file. Over the course of the three-week season, new versions of the library will earn points for the drafter—the larger the version bump, the more points—and whoever has the most points at end of the season wins! 👑
        </p>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  // Get all season progress
  const seasonFilenames = await fs.readdir(SEASONS_DIR);

  const seasons = await Promise.all(seasonFilenames.map(async (filename) => {
    const season = path.basename(filename, '.json');

    return await loadSeasonData(season);
  }));

  return {
    props: {
      seasons,
    }
  };
};

export default IndexPage;
