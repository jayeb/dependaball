import classNames from 'classnames';

import type { SeasonPlayerData } from '@/utils/types';

import styles from './PlayerTag.module.css';

type PlayerTagProps = {
  playerData: SeasonPlayerData;
  className?: string;
}

const PlayerTag = ({
  playerData,
  className,
}: PlayerTagProps): JSX.Element => {
  return (
    <span
      className={classNames(styles.container, className)}
      data-player={`player-${playerData.draftOrder}`}
    >
      {playerData.name}
    </span>
  );
}

export default PlayerTag;
