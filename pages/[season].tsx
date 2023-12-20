import { promises as fs } from 'fs';
import _each from 'lodash/each';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _mapValues from 'lodash/mapValues';
import _orderBy from 'lodash/orderBy';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import path from 'path';

import Divider from '@/components/Divider/Divider';
import PackageScorecard from '@/components/PackageScorecard/PackageScorecard';
import PlayerTag from '@/components/PlayerTag/PlayerTag';
import SeasonBoxScore from '@/components/SeasonBoxScore/SeasonBoxScore';
import SeasonDraftTimeline from '@/components/SeasonDraftTimeline/SeasonDraftTimeline';
import SeasonHeader from '@/components/SeasonHeader/SeasonHeader';
import SeasonPlayers from '@/components/SeasonPlayers/SeasonPlayers';
import SeasonStats from '@/components/SeasonStats/SeasonStats';
import styles from '@/styles/season.module.css';
import getTiebreakerValue from '@/utils/getTiebreakerValue';
import loadSeasonData from '@/utils/loadSeasonData';
import sortPlayers from '@/utils/sortPlayers';
import type {
  SeasonData,
  SeasonPlayerData,
} from '@/utils/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

type SeasonPageProps = SeasonData;

const SeasonPage: NextPage<SeasonPageProps> = (seasonData) => {
  const sortedPackages = _orderBy(seasonData.packages, ['totalPoints', 'name'], ['desc', 'asc']);

  const draftedPackages: Record<string, {
    round: number;
    player: SeasonPlayerData
  }> = {};

  _each(seasonData.players, (playerData) => {
    _each(playerData.packages, (packageData, round) => {
      draftedPackages[packageData.name] = {
        round: round + 1,
        player: playerData
      };
    });
  });

  const sortedPlayers = sortPlayers(seasonData.players);

  return (
    <>
      <Head>
        <title>{seasonData.name}</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏉</text></svg>" />
      </Head>

      <SeasonHeader seasonData={seasonData} />

      <Divider className={styles.divider} />

      <section className={styles.section} id="scores">
        <SeasonBoxScore
          seasonData={seasonData}
          sortedPlayers={sortedPlayers}
        />
      </section>

      <Divider className={styles.divider} />

      <section className={styles.section} id="players">
        <SeasonPlayers sortedPlayers={sortedPlayers} />
      </section>

      <Divider className={styles.divider} />

      <section className={styles.section} id="draft-class">
        <header>
          <h2>
            Draft Class
          </h2>
          <p>
            {`${sortedPackages.length} eligible ${sortedPackages.length === 1 ? 'package' : 'packages'}`}
          </p>
        </header>
        {_map(sortedPackages, (packageData) => (
          <PackageScorecard
            key={packageData.name}
            packageData={packageData}
            timestampRange={[seasonData.startTimestamp, seasonData.endTimestamp]}
            pointValues={seasonData.pointValues}
          >
            {seasonData.isStarted && (
              <p>
                {`Initial: ${packageData.initialVersion}`}
              </p>
            )}
            {packageData.finalVersion && (
              <p>
                {seasonData.isEnded ? 'Final: ' : 'Current: '}
                {packageData.finalVersion}
              </p>
            )}
            <p>
              Drafted:{' '}
              {draftedPackages[packageData.name] ?
                (
                  <>
                    <PlayerTag
                      playerData={draftedPackages[packageData.name].player}
                    />
                    {', round '}
                    {draftedPackages[packageData.name].round}
                  </>
                ) : '―'
              }
              </p>
          </PackageScorecard>
        ))}
      </section>

      <Divider className={styles.divider} />

      <section className={styles.section} id="stats">
        <header>
          <h2>
            Season Stats
          </h2>
        </header>
        <SeasonStats
          seasonData={seasonData}
        />
      </section>

      <Divider className={styles.divider} />

      <section className={styles.section} id="draft-timeline">
        <header>
          <h2>
            Draft Timeline
          </h2>
        </header>
        <SeasonDraftTimeline players={seasonData.players} />
      </section>

      <Divider className={styles.divider} />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const filenames = await fs.readdir(SEASONS_DIR);

  const paths = filenames.map((filename) => {
    const season = path.basename(filename, '.json');

    return {
      params: {
        season,
      }
    };
  });

  return {
    paths,
    fallback: false,
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const season = context.params?.season;

  if (typeof season === 'string') {
    const seasonProgress = await loadSeasonData(season);

    return {
      props: seasonProgress
    };
  } else {
    throw new Error('No season param found');
  }
};

export default SeasonPage;
