import classNames from 'classnames';
import dateFormat from 'dateformat';
import _size from 'lodash/size';
import Link from 'next/link';

import Divider from '@/components/Divider/Divider';
import sortPlayers from '@/utils/sortPlayers';
import type { SeasonData } from '@/utils/types';

import styles from './SeasonHistoryRow.module.css';

type SeasonHistoryRowProps = {
  seasonData: SeasonData;
  className?: string;
}

const SeasonHistoryRow = ({
  seasonData,
  className,
}: SeasonHistoryRowProps): JSX.Element => {
  const sortedPlayers = sortPlayers(seasonData.players);

  return (
    <>
      <Divider className={styles.divider} size="medium" />
      <Link href={`/${seasonData.id}`}>
        <a className={classNames(styles.container, className)}>
          <h2 className={styles.title}>
            {seasonData.name}
          </h2>

          <div className={styles.date}>
            {dateFormat(seasonData.startTimestamp, 'mmm yyyy')}
          </div>

          <div className={styles.players}>
            {sortedPlayers.map((player, index) => (
              <span
                className={styles.player}
                key={player.id}
                data-player={`player-${player.draftOrder}`}
                data-rank={index + 1}
              >
                <img
                  className={styles['player-photo']}
                  src={`/photos/${player.photo}`}
                  alt={player.name}
                  width={24}
                  height={24}
                />
                {index === 0 && (
                  <span className={styles['player-score']}>
                    {player.totalPoints}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className={styles.packages}>
            {_size(seasonData.packages)} packages
          </div>
        </a>
      </Link>
    </>
  );
};

export default SeasonHistoryRow;
