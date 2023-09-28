# Nokori API

There be dragons here - this repo will likely need some touching up before it's simple to stand up locally. PRs welcome.

## About

The Nokori API is a universal data layer that allows developers to connect SQL databases and any third party API via a very intuitive UI in seconds, and then consume queries/endpoints globally without boilerplate code via the SDK.

![image](https://github.com/getnokori/api/assets/1544125/4c3b8d63-d2ab-4857-9f79-5ddabbe69c15)

![image](https://github.com/getnokori/api/assets/1544125/bc4ed21a-020d-41f5-a636-14a5a767dc3c)


Additionally, User Auth and Transactional Emai are also baked in. You can add sign-up flows and user registrations to any app in minutes rather than days.

![image](https://github.com/getnokori/api/assets/1544125/2b5f156e-41f0-46f5-9982-94cb0db45e7b)

![image](https://github.com/getnokori/api/assets/1544125/d5f4cfb1-5f35-4f9d-b4aa-1b72124b459c)

Be sure to check out `./src/routes/index.ts` to see the available endpoints and gain a better understanding of what functionality is available. HubPrompts is an especially cool feature.

## To create the database

Use the sql file found in `./scripts/db/schema-create.sql`

## To run locally

`npm i`

`npm run dev`

## Github Actions

There is a deployment actions file in the `.github/workflows` folder that serves as a good base for deploying to AWS. Assumes you are running ubuntu >18.04 on EC2.
