import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';

import fetchRemoteDependencyFile from './fetchRemoteDependencyFile.js';
import getPackageReleases from './getPackageReleases.js';

// Ensure we have access to .env vars
dotenv.config()

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

async function run() {
  // Make .tmp dir
  try {
    await fs.access(TMP_DIR);
  } catch {
    await fs.mkdir(TMP_DIR);
  }

  // Fetch the remote dependency file
  const remoteDependencies = await fetchRemoteDependencyFile();

  // Write the remote dependency file
  await fs.writeFile(
    path.join(TMP_DIR, 'remote-dependencies.json'),
    JSON.stringify(remoteDependencies, null, 2),
  );

  // Start a running dependencies list
  const allDependencies = [...remoteDependencies];

  // Add all dependencies for each season file
  const seasonFilenames = await fs.readdir(SEASONS_DIR);

  await Promise.allSettled(seasonFilenames.map(async (filename) => {
    const filePath = path.join(SEASONS_DIR, filename);
    const fileContents = await fs.readFile(filePath, 'utf8');

    const seasonData = JSON.parse(fileContents);

    allDependencies.push(...seasonData.draftPool);
  }));

  // Get releases for all dependencies
  const releasesByPackage = {};

  await allDependencies.reduce(async (lastPromise, packageName) => {
    await lastPromise;

    if (releasesByPackage[packageName]) {
      console.log(chalk.grey(`[${packageName}] Already fetched releases; skipping...`));
      return;
    }

    const releases = await getPackageReleases(packageName);

    if (releases) {
      console.log(chalk.green(`[${packageName}] Found ${releases.length} releases.`));
      releasesByPackage[packageName] = releases;
    } else {
      console.log(chalk.red(`[${packageName}] Failed to find releases`));
    }
  }, Promise.resolve());

  console.log('Done fetching releases');

  // Write full releases file
  await fs.writeFile(
    path.join(TMP_DIR, 'all-releases.json'),
    JSON.stringify(releasesByPackage, null, 2)
  );
}

run().then(
  () => {
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
