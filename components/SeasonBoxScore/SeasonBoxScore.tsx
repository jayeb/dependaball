import classNames from 'classnames';
import _map from 'lodash/map';

import ReleaseTimeline from '@/components/ReleaseTimeline/ReleaseTimeline';
import type {
  SeasonData,
  SeasonPlayerData,
} from '@/utils/types';

import styles from './SeasonBoxScore.module.css';

type SeasonBoxScoreProps = {
  seasonData: SeasonData;
  sortedPlayers: SeasonPlayerData[];
  className?: string;
};

const SeasonBoxScore = ({
  seasonData,
  sortedPlayers,
  className,
}: SeasonBoxScoreProps): JSX.Element => {
  const timelineSeries = sortedPlayers.map((playerData, index) => ({
    id: `player-${playerData.draftOrder}`,
    releases: playerData.releases,
  })).reverse();

  return (
    <div className={classNames(styles.container, className)}>
      <ol className={styles.rankings}>
        {_map(sortedPlayers, (playerData, index) => (
          <li
            className={styles['rankings-player']}
            key={playerData.name}
            data-player={`player-${playerData.draftOrder}`}
          >
            <h3 className={styles['rankings-player-name']}>
              <span className={styles['rankings-player-rank']}>
                {`${index + 1}.`}
              </span>
              {playerData.name}
            </h3>
            <p className={styles['rankings-player-score']}>
              {playerData.totalPoints}
            </p>
          </li>
        ))}
      </ol>

      <ReleaseTimeline
        className={styles.timeline}
        series={timelineSeries}
        timestampRange={[
          seasonData.startTimestamp,
          seasonData.endTimestamp,
        ]}
        pointValues={seasonData.pointValues}
        maxPoints={sortedPlayers[0]?.totalPoints ?? 0}
      />
    </div>
  );
}

export default SeasonBoxScore;
