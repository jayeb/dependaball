import classNames from 'classnames';
import _map from 'lodash/map';
import { ReactNode } from 'react';

import type { SeasonPlayerData } from '@/utils/types';

import styles from './PlayerScorecard.module.css';

type PlayerScorecardProps = {
  playerData: SeasonPlayerData;
  className?: string;
}

const PlayerScorecard = ({
  playerData,
  className,
}: PlayerScorecardProps): JSX.Element => {
  return (
    <div
      className={classNames(styles.container, className)}
      data-player={`player-${playerData.draftOrder}`}
    >
      <h3 className={styles.header}>
        <span className={styles['header-name']}>
          {playerData.name}
        </span>

        <span className={styles['header-points']}>
          {playerData.totalPoints}
        </span>
      </h3>

      <ol className={styles.draftees}>
        {_map(playerData.packages, (packageData, index) => (
          <li key={index} className={styles['draftees-pick']}>
            <span className={styles['draftees-pick-name']} title={packageData.name}>
              {packageData.name}
            </span>
            <span className={styles['draftees-pick-points']}>
              {packageData.totalPoints}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PlayerScorecard;
