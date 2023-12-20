import classNames from 'classnames';
import _each from 'lodash/each';
import _map from 'lodash/map';
import { ReactNode } from 'react';

import type {
  PackageData,
  SeasonPlayerData
} from '@/utils/types';

import styles from './SeasonDraftTimeline.module.css';

type SeasonDraftTimelineProps = {
  players: SeasonPlayerData[];
  className?: string;
}

const SeasonDraftTimeline = ({
  players,
  className,
}: SeasonDraftTimelineProps): JSX.Element => {
  const draftRounds: PackageData[][] = [];

  _each(players, (playerData) => {
    _each(playerData.packages, (packageData, round) => {
      if (!draftRounds[round]) {
        draftRounds[round] = [];
      }

      draftRounds[round].push(packageData);
    });
  });

  return (
    <div
      className={classNames(styles.container, className)}
      style={{
        ['--this-players' as any]: `${players.length}`,
      }}
    >
      {_map(draftRounds, (packages, round) => (
        <div
          className={styles.round}
          key={`round-${round}`}
          data-reverse={round % 2 || undefined}
        >
          <h3 className={styles['round-title']}>
            {`Round ${round + 1}`}
          </h3>

          <ol className={styles['round-picks']}>
            {_map(packages, (packageData, index) => (
              <li
                className={styles.pick}
                key={packageData.name}
                data-player={`player-${index + 1}`}
              >
                {`${players[index].name}: `}
                <strong>{packageData.name}</strong>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};

export default SeasonDraftTimeline;
