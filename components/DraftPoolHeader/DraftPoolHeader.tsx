import classNames from 'classnames';
import dateFormat from 'dateformat';
import Link from 'next/link'

import Divider from '@/components/Divider/Divider';
import type { SeasonData } from '@/utils/types';

import styles from './DraftPoolHeader.module.css';

type DraftPoolHeaderProps = {
  dayCount: number;
  className?: string;
}

const DraftPoolHeader = ({
  dayCount,
  className,
}: DraftPoolHeaderProps): JSX.Element => {
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
          Draft Pool
        </h1>

        <p className={styles.count}>
          <select
            onChange={(event) => {
              window.location.href = event.target.value;
            }}
            defaultValue={dayCount}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
          </select>
        </p>
      </div>

      <Divider className={styles.divider} />
    </header>
  );
}

export default DraftPoolHeader;
