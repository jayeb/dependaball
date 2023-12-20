import classNames from 'classnames';
import dateFormat from 'dateformat';
import { CSSProperties } from 'react';

import type {PackageRelease} from '@/utils/types';

import styles from './ReleaseIcon.module.css';

type ReleaseIconProps = {
  release: PackageRelease;
  className?: string;
  style?: CSSProperties;
  playerId?: string;
}

const ReleaseIcon = ({
  release,
  className,
  style,
  playerId,
}: ReleaseIconProps): JSX.Element => {
  let iconPath;

  switch (release.bump) {
    case 'major':
    case 'initial':
      iconPath = <path d="M11.5135 0.414561C11.7939 0.175676 12.2061 0.175675 12.4865 0.414561L15.489 2.97328C15.6091 3.07565 15.7585 3.13751 15.9158 3.15007L19.8482 3.46388C20.2153 3.49317 20.5068 3.78471 20.5361 4.15184L20.8499 8.08422C20.8625 8.24155 20.9244 8.3909 21.0267 8.51103L23.5854 11.5135C23.8243 11.7939 23.8243 12.2061 23.5854 12.4865L21.0267 15.489C20.9244 15.6091 20.8625 15.7585 20.8499 15.9158L20.5361 19.8482C20.5068 20.2153 20.2153 20.5068 19.8482 20.5361L15.9158 20.8499C15.7585 20.8625 15.6091 20.9244 15.489 21.0267L12.4865 23.5854C12.2061 23.8243 11.7939 23.8243 11.5135 23.5854L8.51103 21.0267C8.3909 20.9244 8.24155 20.8625 8.08422 20.8499L4.15184 20.5361C3.78471 20.5068 3.49317 20.2153 3.46388 19.8482L3.15007 15.9158C3.13751 15.7585 3.07565 15.6091 2.97328 15.489L0.414561 12.4865C0.175676 12.2061 0.175675 11.7939 0.414561 11.5135L2.97328 8.51103C3.07565 8.3909 3.13751 8.24155 3.15007 8.08422L3.46388 4.15184C3.49317 3.78471 3.78471 3.49317 4.15184 3.46388L8.08422 3.15007C8.24155 3.13751 8.3909 3.07565 8.51103 2.97328L11.5135 0.414561Z"/>;
      break;
    case 'minor':
      iconPath = <path d="M11.1622 1.68917C11.6687 1.34812 12.3313 1.34812 12.8378 1.68917L17.8543 5.06719L22.6172 8.79432C23.0981 9.17062 23.3029 9.80086 23.135 10.388L21.4725 16.2028L19.3996 21.8843C19.1903 22.4579 18.6542 22.8475 18.044 22.8692L12 23.085L5.956 22.8692C5.34578 22.8475 4.80966 22.4579 4.60038 21.8843L2.52748 16.2028L0.86498 10.388C0.697129 9.80086 0.901907 9.17062 1.38278 8.79432L6.14566 5.06719L11.1622 1.68917Z"/>;
      break;
    case 'patch':
      iconPath = <path d="M10.701 5.25C11.2783 4.25 12.7217 4.25 13.299 5.25L17.1962 12L21.0933 18.75C21.6706 19.75 20.9489 21 19.7942 21H12H4.20577C3.05107 21 2.32938 19.75 2.90673 18.75L6.80385 12L10.701 5.25Z"/>;
      break;
  }

  return (
    <div
      className={classNames(styles.container, className)}
      style={style}
      data-bump={release.bump}
      data-player={playerId ?? null}
    >
      <svg viewBox="0 0 24 24" className={styles.icon}>
        {iconPath}
      </svg>
      <div className={styles.tooltip}>
        <p className={styles['tooltip-packageName']}>
          {release.packageName}
        </p>
        <p className={styles['tooltip-version']}>
          {`${release.version} (${release.bump})`}
        </p>
        <p className={styles['tooltip-date']}>
          {dateFormat(release.timestamp, 'yyyy-mm-dd HH:MM')}
        </p>
      </div>
    </div>
  );
};

export default ReleaseIcon;
