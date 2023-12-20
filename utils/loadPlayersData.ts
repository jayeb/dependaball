import { promises as fs } from 'fs';
import path from 'path';

import type {
  PlayerData,
  PlayerJson,
} from '@/utils/types';

const DATA_DIR = path.join(process.cwd(), 'data');

export default async function loadPlayersData(): Promise<PlayerData[]> {
  const filePath = path.join(DATA_DIR, 'players.json');
  const fileContents = await fs.readFile(filePath, 'utf8');

  let playersData: PlayerJson;

  try {
    playersData = JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Could not load players file: ${error}`);
  }

  return playersData.map((player) => ({
    id: player.name.toLowerCase(),
    ...player
  }));
};
