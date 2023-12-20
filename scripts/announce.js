import { promises as fs } from 'fs';
import path from 'path';
import dotenv from "dotenv";
import _ from 'lodash';
import fetch from 'node-fetch';

// Ensure we have access to .env vars
dotenv.config();

const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS_DIR = path.join(DATA_DIR, 'seasons');
const TMP_DIR = path.join(DATA_DIR, '.tmp');

const BUMP_EMOJI = {
  major: ':dependaball-major:',
  minor: ':dependaball-minor:',
  patch: ':dependaball-patch:',
};

const HOUR_LENGTH = 1000 * 60 * 60;
const DAY_LENGTH = HOUR_LENGTH * 24;

async function run() {
  if (!process.env.SLACK_AUTH_TOKEN || !process.env.SLACK_CHANNEL) {
    throw new Error('No Slack auth token present in env');
  }

  let since;
  if (process.env.ANNOUNCE_SINCE) {
    since = parseInt(process.env.ANNOUNCE_SINCE, 10);
  } else {
    console.log('No "since" timestamp present in env.');
    since = Date.now();
  }

  let now;
  if (process.env.ANNOUNCE_NOW) {
    now = parseInt(process.env.ANNOUNCE_NOW, 10);
  } else {
    console.log('No "now" timestamp present in env.');
    now = Date.now();
  }

  console.log(`Looking for releases between ${since} and ${now}`);

  // Load files
  const allReleases = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, 'all-releases.json'), 'utf8')
  );

  const seasonFilenames = await fs.readdir(SEASONS_DIR);

  await seasonFilenames.reduce(async (lastPromise, filename) => {
    await lastPromise;

    // Load file data
    const filePath = path.join(SEASONS_DIR, filename);
    const fileContents = await fs.readFile(filePath, 'utf8');

    const seasonData = JSON.parse(fileContents);

    // Decide how to proceed based on times
    const seasonStart = Date.parse(seasonData.start);
    const seasonEnd = Date.parse(seasonData.end);

    const seasonRounds = seasonData.players[0].draftees.length;

    if (now < seasonStart) {
      // Season has not started yet
      console.log(`${seasonData.name}: Has not started yet`);
      return;
    } else if (since > seasonEnd) {
      // Season has long since ended
      console.log(`${seasonData.name}: Has already ended`);
      return;
    }

    const packagesByPlayer = {};
    // This is zero-indexed
    const packagesByDraftRound = {};
    const playerData = {};
    const previousPlayerData = {};

    _.each(seasonData.players, ({name, draftees}) => {
      _.each(draftees, (packageName, index) => {
        packagesByPlayer[packageName] = name;
        packagesByDraftRound[packageName] = index;
      });

      playerData[name] = {
        name,
        totalPoints: 0,
        packagePoints: _.times(seasonRounds, _.constant(0)),
      };
      previousPlayerData[name] = {
        name,
        totalPoints: 0,
        packagePoints: _.times(seasonRounds, _.constant(0)),
      };
    });

    const releaseMessages = [];

    _.each(seasonData.draftPool, (packageName) => {
      const owner = packagesByPlayer[packageName];
      const round = packagesByDraftRound[packageName];

      allReleases[packageName].forEach((release) => {
        if (release.timestamp < seasonStart) {
          return;
        }

        if (release.timestamp > seasonEnd || release.timestamp > now) {
          return;
        }

        const points = seasonData.pointValues[release.bump];
        const isNewRelease = release.timestamp >= since;

        if (isNewRelease) {
          let slackMessage = `${BUMP_EMOJI[release.bump]} \`${packageName}\`: \`${release.version}\` (${release.bump})`;

          if (owner) {
            const noun = points === 1 ? 'point' : 'points';
            slackMessage += `\n       +${points} ${noun} for *${owner}*`;
          }

          releaseMessages.push(slackMessage);
        }

        if (owner && round >= 0) {
          playerData[owner].totalPoints += points;
          playerData[owner].packagePoints[round] += points;

          if (!isNewRelease) {
            previousPlayerData[owner].totalPoints += points;
            previousPlayerData[owner].packagePoints[round] += points;
          }
        }
      });
    });

    const getStandings = (playerData) =>
      _.chain(playerData)
        .each((player) => {
            const sortedPoints = _.orderBy(player.packagePoints, [_.identity], ['desc']);

            player.tiebreakerValue = sortedPoints.reduce((value, points, index) => {
              // This approach yields a number where *every other* place value
              // represents the point value of a given draft pick, in reverse order.
              // A draft pick that scores more than 100 points will cause this algo
              // to malfunction--the assumption is that a package scoring 100+ points
              // would probably not require a tiebreaker.
              return value + (points * Math.pow(10, index * 2));
            }, 0);
          })
        .orderBy(
            ['totalPoints', 'tiebreakerValue', 'draftOrder'],
            ['desc', 'desc', 'asc']
          )
        .each((player, index) => {
            player.place = index + 1;
          })
        .keyBy('name')
        .value();

    const standings = getStandings(playerData);
    const previousStandings = getStandings(previousPlayerData);

    const standingsStrings = _.chain(standings)
      .orderBy(['place'], ['asc'])
      .map(({name, totalPoints, place}) => {
          const previousPlace = previousStandings[name].place;

          let arrows = '';

          if (place < previousPlace) {
            arrows = _.repeat('↑', previousPlace - place);
          } else if (place > previousPlace) {
            arrows = _.repeat('↓', place - previousPlace);
          }

          const noun = totalPoints === 1 ? 'point' : 'points';

          return `${place}) *${name}* - ${totalPoints} ${noun} ${arrows}`;
        })
      .value();

    // Season is over but has not been announced
    let seasonHasEnded = (now >= seasonEnd);

    if (seasonHasEnded) {
      console.log(`${seasonData.name}: Season has ended. Announcing!`);
    } else if (releaseMessages.length) {
      console.log(`${seasonData.name}: ${releaseMessages.length} new releases found. Announcing!`);
    } else {
      console.log(`${seasonData.name}: No new releases, no announcement`);
    }

    if (releaseMessages.length || seasonHasEnded) {
      let fullMessage = '';

      if (seasonHasEnded) {
        fullMessage += `*:checkered_flag: ${seasonData.name} has ended!*\n\n`;
      } else {
        const percentage = ((now - seasonStart) / (seasonEnd - seasonStart) * 100).toFixed(1);
        fullMessage += `*:clipboard: ${seasonData.name} is ${percentage}% complete.*\n\n`;
      }

      if (releaseMessages.length) {
        fullMessage += `*New package versions:*\n\n${releaseMessages.join('\n\n')}\n\n`;
      }

      // Add standings
      fullMessage += `*Current Standings:*\n${standingsStrings.join('\n')}\n\n`;

      if (seasonHasEnded) {
        const winners = _.filter(standings, ({place}) => place === 1);
        let winnerList;
        if (winners.length === 1) {
          winnerList = `winner ${winners[0].name}`;
        } else if (winners.length === 2) {
          winnerList = `winners ${winners[0].name} and ${winners[1].name}`;
        } else {
          const commaSep = _.initial(winners)
            .map((winner) => winner.name);
          winnerList = `winners ${commaSep.join(', ')}, and ${_.last(winners).name}`;
        }

        fullMessage += `*:sports_medal: Congratulations to our ${winnerList}!*`;
      } else {
        const msleft = seasonEnd - now;
        const daysLeft = Math.floor(msleft / DAY_LENGTH);
        const hoursLeft = Math.floor((msleft % DAY_LENGTH) / HOUR_LENGTH);

        fullMessage += '_:stopwatch: The season will end in ';

        // More than a day remaining
        if (daysLeft) {
          fullMessage += `${daysLeft} ${daysLeft == 1 ? 'day' : 'days'}`;

          if (hoursLeft) {
            fullMessage += ` & ${hoursLeft} ${hoursLeft == 1 ? 'hour' : 'hours'}`;
          }
        // Less than a day remaining
        } else if (hoursLeft) {
          fullMessage += `${hoursLeft} ${hoursLeft == 1 ? 'hour' : 'hours'}`;

        // Less than an hour remaining
        } else {
          fullMessage += 'less than an hour';
        }

        fullMessage += '._';
      }

      const body = {
        text: fullMessage,
        username: 'Dependaball',
        icon_emoji: ':rugby_football:',
        channel: process.env.SLACK_CHANNEL
      };

      const endpoint = 'https://slack.com/api/chat.postMessage';
      const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers:  {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + process.env.SLACK_AUTH_TOKEN
        }
      };

      await fetch(endpoint, options);
    }
  }, Promise.resolve());
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
