import chalk from 'chalk';
import dateFormat from 'dateformat';
import { promises as fs } from 'fs';
import inquirer from 'inquirer';
import _ from 'lodash';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

const HOUR_DURATION = (60 * 60 * 1000);
const DAY_DURATION = (24 * HOUR_DURATION);

const getInt = (value, min) => {
  if (_.isFinite(value)) {
    return Math.max(min, Math.floor(value));
  } else {
    return min;
  }
}

const run = async () => {
  // Load files
  const remoteDependenciesList = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, 'remote-dependencies.json'), 'utf8')
  );
  const allReleases = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, 'all-releases.json'), 'utf8')
  );
  const allPlayers = JSON.parse(
    await fs.readFile(path.join(DATA_DIR, 'players.json'), 'utf8')
  );

  const seasonStart = Date.now();

  const playerChoices = allPlayers
    .filter((player) => player.active)
    .map((player) => ({
        name: player.name,
        value: player.name,
        checked: true
      }));

  // Gather basic season info
  let {seasonName, dayCount, players} = await inquirer.prompt([
    {
      name: 'seasonName',
      message: 'What are we calling this season?',
      type: 'input',
      default: 'Season N'
    },
    {
      name: 'dayCount',
      message: 'How many days will this season last?',
      type: 'number',
      default: 21,
    },
    {
      name: 'players',
      message: 'Who is playing this season?',
      type: 'checkbox',
      choices: playerChoices,
    }
  ]);

  // Settle end date, rounded down to the nearest hour
  dayCount = getInt(dayCount, 0);
  const seasonEnd = Math.floor(
    (seasonStart + (DAY_DURATION * dayCount)) / HOUR_DURATION
  ) * HOUR_DURATION;

  // Determine which dependencies to use
  const {useWhichDependencies} = await inquirer.prompt([
    {
      name: 'useWhichDependencies',
      message: 'Would you like to choose which dependencies are draft-eligible?',
      type: 'list',
      choices: [
        {
          name: 'Yes, let me choose',
          value: 'choose'
        },
        {
          name: 'All dependencies are eligible',
          value: 'all'
        }
      ],
    }
  ]);

  let chosenDependencies;

  if (useWhichDependencies === 'all') {
    chosenDependencies = remoteDependenciesList;
  } else {
    const packageChoices = remoteDependenciesList.map((packageName) => ({
      name: `${packageName}`,
      value: packageName,
      checked: true
    }));

    let answers = await inquirer.prompt([
      {
        name: 'chosenDependencies',
        message: 'Choose which dependencies to use this season:',
        type: 'checkbox',
        choices: packageChoices,
      }
    ]);

    chosenDependencies = answers.chosenDependencies;
  }

  // Gather point values
  let {majorPoints, minorPoints, patchPoints} = await inquirer.prompt([
    {
      name: 'majorPoints',
      message: 'How many points is a major version bump worth?',
      type: 'number',
      default: 5
    },
    {
      name: 'minorPoints',
      message: 'How many points is a minor version bump worth?',
      type: 'number',
      default: 3
    },
    {
      name: 'patchPoints',
      message: 'How many points is a patch version bump worth?',
      type: 'number',
      default: 1
    },
  ]);

  majorPoints = getInt(majorPoints, 0);
  minorPoints = getInt(minorPoints, 0);
  patchPoints = getInt(patchPoints, 0);

  // Set up season contents
  const seasonContents = {
    name: seasonName,
    pointValues: {
        major: majorPoints,
        minor: minorPoints,
        patch: patchPoints,
      },
    start: dateFormat(seasonStart, 'isoUtcDateTime'),
    end: dateFormat(seasonEnd, 'isoUtcDateTime'),
    players: _.chain(players)
      .shuffle()
      .map((playerName) => ({
          name: playerName,
          draftees: []
        }))
      .value(),
    draftPool: chosenDependencies
  };

  const {roundsCount} = await inquirer.prompt([
    {
      name: 'roundsCount',
      message: 'How many rounds will we be drafting?',
      type: 'number',
      default: 6,
    }
  ]);

  if (seasonContents.players.length) {
    console.log(chalk.yellow('\n🤘 Righteous! Let\'s draft.\n'));

    const fullPickOrder = _.chain(getInt(roundsCount, 1))
      .times((roundIndex) => {
          let order;

          if (roundIndex % 2) {
            // Odd rounds get reversed
            order = [...seasonContents.players].reverse();
          } else {
            order = seasonContents.players;
          }

          return _.map(order, (player) => ({
            player,
            round: roundIndex + 1
          }));
        })
      .flatten()
      .value();

    const packageChoices = _.chain(seasonContents.draftPool)
      .invert()
      .mapValues((index, packageName) => {
          const initialVersion = _.chain(allReleases)
            .get(packageName)
            .last()
            .get('version')
            .value();

          return {
            name: `${packageName} (${initialVersion ?? 'no initial version'})`,
            value: packageName,
            short: packageName,
          };
        })
      .value();

    await _.reduce(fullPickOrder, async (promise, pick) => {
      await promise;

      let {packageName} = await inquirer.prompt([
        {
          name: 'packageName',
          message: `Round ${pick.round}: ${pick.player.name}'s selection`,
          type: 'list',
          choices: _.values(packageChoices)
        }
      ]);

      // Remove this choice from contention
      delete packageChoices[packageName];

      pick.player.draftees.push(packageName);
    }, Promise.resolve(packageChoices));
  }

  // TODO: Write to file
  const {fileNameBase} = await inquirer.prompt([
    {
      name: 'fileNameBase',
      message: 'Please provide a filename for this season\'s JSON file',
      type: 'input',
      default: seasonContents.name.toLowerCase().replace(/[^a-z0-9]/gi, '-'),
    }
  ]);

  await fs.writeFile(
    path.join(SEASONS_DIR, `${fileNameBase}.json`),
    JSON.stringify(seasonContents, null, 2),
  );

  console.log(chalk.green('\n✅ Best of luck to all our players this season! 🏉'));
};

run().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(chalk.red(error));
  process.exit(1);
});
