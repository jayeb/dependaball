import classNames from 'classnames';
import _times from 'lodash/times';

import ReleaseIcon from '@/components/ReleaseIcon/ReleaseIcon';
import defaultPointValues from '@/utils/defaultPointValues';
import type { PackageRelease, SeasonPointValues } from '@/utils/types';

import styles from './ReleaseTimeline.module.css';

type ReleaseTimelineSeries = {
  id: string;
  releases: PackageRelease[];
}

type ReleaseTimelineProps = {
  series: ReleaseTimelineSeries[];
  timestampRange: [number, number];
  maxPoints: number;
  pointValues?: SeasonPointValues;
  className?: string;
}

const ReleaseTimeline = ({
  series,
  timestampRange,
  maxPoints,
  pointValues = defaultPointValues,
  className,
}: ReleaseTimelineProps): JSX.Element => {
  let [startTimestamp, endTimestamp] = timestampRange;

  const now = Date.now();

  maxPoints = Math.max(maxPoints, 4);

  const scaleTimestamp = (timestamp: number) => {
    const value = (timestamp - startTimestamp) / (endTimestamp - startTimestamp);

    // Convert to scale 0-100 & round to two decimal points
    return Math.round(value * 10000) / 100;
  };

  const scalePointValue = (pointValue: number) => {
    const value = pointValue / maxPoints;

    // Convert to scale 0-100 & round to two decimal points
    return Math.round(value * 10000) / 100;
  };

  const pathElements: JSX.Element[] = [];
  const releaseIcons: JSX.Element[] = [];

  series.forEach(({id, releases}, index) => {
    const isPlayer = /player-\d+/.test(id);

    let graphPath = 'M0,100 ';
    let runningPointTotal = 0;

    releases.map((release) => {
      if (release.bump !== 'initial') {
        runningPointTotal += pointValues[release.bump];
      }

      const x = scaleTimestamp(release.timestamp);
      const y = scalePointValue(runningPointTotal);

      // Draw a horizontal line to this timestamp
      graphPath += `H${x} `;
      // Draw a vertical line equal to new point total
      graphPath += `V${100-y}`;

      releaseIcons.push(
        <ReleaseIcon
          playerId={isPlayer ? id : undefined}
          style={{
            position: 'absolute',
            left: `${x}%`,
            bottom: `${y}%`,
          }}
          release={release}
          key={`${release.packageName}/${release.version}`}
        />
      );
    });

    // Draw horizontal line to end or to current point on timeline
    if (now < endTimestamp) {
      graphPath += `H${scaleTimestamp(now)}`;
    } else {
      graphPath += 'H100';
    }

    pathElements.push(
      <path
        className={styles['paths-graphLine']}
        d={graphPath}
        vectorEffect="non-scaling-stroke"
        data-player={isPlayer ? id : undefined}
        key={id}
      />
    );
  });

  const tickMarks = _times(maxPoints + 1, (index) => {
    const y = scalePointValue(index);
    return (
      <path
        key={index}
        className={styles['paths-tickMark']}
        d={`M0,${y} H100`}
        vectorEffect="non-scaling-stroke"
      />
    );
  });

  const style = {
    // We're using a custom CSS property here, so it doesn't exist in the CSSProperties type
    ['--this-totalUnits' as any]: maxPoints
  };

  return (
    <div
      className={classNames(styles.container, className)}
      style={style}
    >
      <svg
        className={styles.paths}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {pathElements}
      </svg>
      <div className={styles.annotations}>
        {releaseIcons}
      </div>
    </div>
  );
};

export default ReleaseTimeline
