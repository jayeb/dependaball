import classNames from 'classnames';
import _each from 'lodash/each';
import _size from 'lodash/size';

import Divider from '@/components/Divider/Divider';
import type {
  SeasonData
} from '@/utils/types';

import styles from './SeasonStats.module.css';

type SeasonStatsProps = {
  seasonData: SeasonData;
  className?: string;
}

const SeasonStats = ({
  seasonData,
  className,
}: SeasonStatsProps): JSX.Element => {
  let totalPoints = 0;
  let totalReleases = 0;
  let majorReleases = 0;
  let minorReleases = 0;
  let patchReleases = 0;

  _each(seasonData.packages, (packageData) => {
    totalPoints += packageData.totalPoints;

    _each(packageData.releases, (release) => {
      totalReleases++;

      if (release.bump === 'major') {
        majorReleases++;
      } else if (release.bump === 'minor') {
        minorReleases++;
      } else if (release.bump === 'patch') {
        patchReleases++;
      }
    });
  });

  const totalDraftedPoints = seasonData.players.reduce(
    (runningTotal, playerData) => runningTotal + playerData.totalPoints
  , 0)
  const totalUndraftedPoints = totalPoints - totalDraftedPoints;
  const draftEfficiency = `${(totalDraftedPoints / totalPoints * 100).toFixed(1)}%`;

  const averagePlayerEfficiency = `${(totalDraftedPoints / totalPoints / seasonData.players.length * 100).toFixed(1)}%`;
  const averagePointsPerPlayer = (totalDraftedPoints / seasonData.players.length).toFixed(1);
  const averagePointsPerDraftee = (totalPoints / _size(seasonData.packages)).toFixed(1);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.group}>
        <p className={styles.stat}>
          Total points scored:
          {' '}
          <strong>{totalPoints}</strong>
        </p>
        <p className={styles.stat}>
          Total drafted points:
          {' '}
          <strong>{totalDraftedPoints}</strong>
        </p>
        <p className={styles.stat}>
          Total undrafted points:
          {' '}
          <strong>{totalUndraftedPoints}</strong>
        </p>
        <p className={styles.stat}>
          Draft efficiency:
          {' '}
          <strong>{draftEfficiency}</strong>
        </p>
      </div>

      <div className={styles.group}>
        <p className={styles.stat}>
          Total releases:
          {' '}
          <strong>{totalReleases}</strong>
        </p>
        <p className={styles.stat}>
          Major releases:
          {' '}
          <strong>{majorReleases}</strong>
        </p>
        <p className={styles.stat}>
          Minor releases:
          {' '}
          <strong>{minorReleases}</strong>
        </p>
        <p className={styles.stat}>
          Patch releases:
          {' '}
          <strong>{patchReleases}</strong>
        </p>
      </div>

      <div className={styles.group}>
        <p className={styles.stat}>
          Avg. player efficiency:
          {' '}
          <strong>{averagePlayerEfficiency}</strong>
        </p>
        <p className={styles.stat}>
          Avg. points per player:
          {' '}
          <strong>{averagePointsPerPlayer}</strong>
        </p>
        <p className={styles.stat}>
          Avg. points per draftee:
          {' '}
          <strong>{averagePointsPerDraftee}</strong>
        </p>
      </div>
    </div>
  );
}

export default SeasonStats;
