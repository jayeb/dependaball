import _orderBy from 'lodash/orderBy';

import type { SeasonPlayerData } from '@/utils/types';

export default function sortPlayers(players: SeasonPlayerData[]): SeasonPlayerData[] {
  return _orderBy(players, [
    'totalPoints',
    'tiebreakerValue',
    'draftOrder'
  ], ['desc', 'desc', 'asc']);
}
