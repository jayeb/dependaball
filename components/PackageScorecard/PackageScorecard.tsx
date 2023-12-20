import classNames from 'classnames';
import { ReactNode } from 'react';

import Divider from '@/components/Divider/Divider';
import ReleaseTimeline from '@/components/ReleaseTimeline/ReleaseTimeline';
import type { PackageData, SeasonPointValues } from '@/utils/types';

import styles from './PackageScorecard.module.css';

type PackageScorecardProps = {
  packageData: PackageData;
  timestampRange: [number, number];
  pointValues: SeasonPointValues;
  children?: ReactNode;
  className?: string;
}

const PackageScorecard = ({
  packageData,
  timestampRange,
  pointValues,
  children,
  className,
}: PackageScorecardProps): JSX.Element => {
  return (
    <div className={classNames(styles.container, className)}>
      <Divider className={styles.divider} size="medium" />

      <div className={styles.content}>
        <div className={styles.metadata}>
          <h3 className={styles['metadata-packageName']}>
            {packageData.name}
          </h3>

          {children && (
            <div className={styles['metadata-extras']}>
              {children}
            </div>
          )}
        </div>

        <ReleaseTimeline
          className={styles.releases}
          series={[
            {
              id: packageData.name,
              releases: packageData.releases,
            }
          ]}
          timestampRange={timestampRange}
          pointValues={pointValues}
          maxPoints={packageData.totalPoints}
        />

        <div className={styles.points}>
          <span className={styles['points-value']}>
            {packageData.totalPoints}
          </span>
          {' '}
          <span className={styles['points-label']}>
            {packageData.totalPoints === 1 ? 'point' : 'points'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PackageScorecard;
