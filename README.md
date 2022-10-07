# project-boilerplate

## Requirements

1. Install docker
2. Install docker-compose
3. Install node.js with nvm. [NVM GitHub](https://github.com/nvm-sh/nvm)
4. Install yarn with `npm i -g yarn`
5. Call task in VS code: `Create new docker builder` (call only once when pulling project). Command could be also found in `./.vscode/tasks.json`
6. Run `yarn` inside `./backend`
7. Run `yarn` inside `./frontend`

## Installation

1. Run `yarn mount` to mount `./frontend/backendTypes` for better VS code support
2. Call task in VS code: `Up dev`. Command could be also found in `./.vscode/tasks.json`

## How to run psql

```bash
yarn psql
```

## TODO

[ ] password recovery|reset

[ ] connect testing libraries

[ ] add healthcheck

[ ] add removing expired tokens from whitelisted store

[ ] add redis as session token store
