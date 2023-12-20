import classNames from 'classnames';
import dateFormat from 'dateformat';
import Link from 'next/link'

import Divider from '@/components/Divider/Divider';
import type { SeasonData } from '@/utils/types';

import styles from './SeasonHeader.module.css';

type SeasonHeaderProps = {
  seasonData: SeasonData;
  className?: string;
}

const SeasonHeader = ({
  seasonData,
  className,
}: SeasonHeaderProps): JSX.Element => {
  return (
    <header className={classNames(styles.container, className)}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <Link href="/">
            <a
              className={styles['title-backLink']}
              title="Home"
            ></a>
          </Link>
          {' '}
          {seasonData.name}
        </h1>

        <div className={styles.dates}>
          <p>
            {seasonData.isStarted ? 'Started' : 'Starting'}
            {' '}
            {dateFormat(seasonData.startTimestamp, 'yyyy-mm-dd')}
          </p>
          <p className={styles.date}>
            {seasonData.isEnded ? 'Ended' : 'Ending'}
            {' '}
            {dateFormat(seasonData.endTimestamp, 'yyyy-mm-dd')}
          </p>
        </div>

        <nav className={styles.nav}>
          <Link href="#scores">
            <a data-icon="🏆"><span>Scores</span></a>
          </Link>
          <Link href="#players">
            <a data-icon="🕺"><span>Players</span></a>
          </Link>
          <Link href="#draft-class">
            <a data-icon="🧢"><span>Draft Class</span></a>
          </Link>
          <Link href="#stats">
            <a data-icon="🧮"><span>Stats</span></a>
          </Link>
          <Link href="#draft-timeline">
            <a data-icon="🐍"><span>Draft Timeline</span></a>
          </Link>
        </nav>
      </div>

      <Divider className={styles.divider} />
    </header>
  );
}

export default SeasonHeader;
