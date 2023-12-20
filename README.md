# 🏉 Dependaball

Dependaball is a fantasy-sporting game developed at Balsa to counteract the crushing despair of trying to keep an increasingly-large stable of technical dependencies up to date. A new version of a dependency should be cause for rejoicing, but when these updates pile up, dealing with them can become a real chore. So to bring back some of the joy of dependency updates, we decided to make a game of it!

Every month we kick off a new season of Dependaball by sitting down together and drafting our favorite dependencies from our monorepo's `package.json` file. Over the course of the three-week season, new versions of the library will earn points for the drafter—the larger the version bump, the more points—and whoever has the most points at end of the season wins! 👑

This repo contains all the tool you need to run a Dependaball league:

- Scripts for running a draft via CLI
- Code to read & write static draft data files for each season
- A Next.js-based static site generator for building pages for your league
- A workflow for deploying the aforementioned static site to Vercel
- A script for announcing the state & leaderboard of an in-progress season to a Slack channel

---

## `.env` variables

In order to run, some variables need to be defined in your `.env` file.

### AWS variables:

These variables allow the `prebuild` script to fetch a list of remote dependencies from an AWS bucket. See `data/remote-dependencies.example.json` for the expected format of this file.

- `DEPENDENCIES_AWS_BUCKET`
- `DEPENDENCIES_AWS_ACCESS_KEY`
- `DEPENDENCIES_AWS_SECRET_KEY`
- `DEPENDENCIES_FILE`

### Vercel variables:

These variables are used by the `deploy` workflow to deploy the static site to Vercel:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`

### Slack variables

These variables allow the `announce` script to publish messages to a Slack channel about the progress of the ongoing season.

- `SLACK_AUTH_TOKEN`
- `SLACK_CHANNEL`
