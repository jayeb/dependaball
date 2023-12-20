import _orderBy from 'lodash/orderBy';

import type { PackageData } from '@/utils/types';

export default function getTiebreakerValue(packages: PackageData[]): number {
  const sortedPackages = _orderBy(packages, ['totalPoints'], ['desc']);

  return sortedPackages.reduce((value, {totalPoints}, index) => {
    // This approach yields a number where *every other* place value
    // represents the point value of a given draft pick, in reverse order.
    // A draft pick that scores more than 100 points will cause this algo
    // to malfunction--the assumption is that a package scoring 100+ points
    // would probably not require a tiebreaker.
    return value + (totalPoints * Math.pow(10, index * 2));
  }, 0);
};
