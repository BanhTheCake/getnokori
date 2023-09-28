# Nokori API

There be dragons here - this repo will likely need some touching up before it's simple to stand up locally. PRs welcome.

## About

The Nokori API is a universal data layer that allows developers to connect SQL databases and any third party API via a very intuitive UI in seconds, and then consume queries/endpoints globally without boilerplate code via the SDK.

Additionally, User Auth and Transactional Emai are also baked in. You can add sign-up flows and user registrations to any app in minutes rather than days.

Be sure to check out `./src/routes/index.ts` to see the available endpoints and gain a better understanding of what functionality is available. HubPrompts is an especially cool feature.

## To create the database

Use the sql file found in `./scripts/db/schema-create.sql`

## To run locally

`npm i`

`npm run dev`

## Github Actions

There is a deployment actions file in the `.github/workflows` folder that serves as a good base for deploying to AWS. Assumes you are running ubuntu >18.04 on EC2.
