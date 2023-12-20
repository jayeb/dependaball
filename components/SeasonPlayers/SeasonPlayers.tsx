import classNames from 'classnames';
import _map from 'lodash/map';
import { ReactNode } from 'react';

import PlayerScorecard from '@/components/PlayerScorecard/PlayerScorecard';
import type { SeasonPlayerData } from '@/utils/types';

import styles from './SeasonPlayers.module.css';

type SeasonPlayersProps = {
  sortedPlayers: SeasonPlayerData[];
  className?: string;
}

const SeasonPlayers = ({
  sortedPlayers,
  className,
}: SeasonPlayersProps): JSX.Element => {
  return (
    <div className={classNames(styles.container, className)}>
      {_map(sortedPlayers, (playerData) => (
        <PlayerScorecard
          key={playerData.name}
          playerData={playerData}
        />
      ))}
    </div>
  );
};

export default SeasonPlayers;
