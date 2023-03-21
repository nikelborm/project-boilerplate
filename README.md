# project-boilerplate

## Requirements and initialization

If you don't have vs code, search for commands in `./project.code-workspace`

1. Install docker, docker-compose, buildx
2. Install node.js 16 with nvm. [NVM GitHub](https://github.com/nvm-sh/nvm)
3. Install yarn with `npm i -g yarn`
4. Call task in VS code: `Create new docker builder` (call only once when pulling project)
5. Call task in VS code: `Use docker builder` (call only once when pulling project)
6. Call task in VS code: `Install yarn dependencies` (call only once when pulling project)

## Development

If you plan to develop and use own fs

1. Call task in VS code for better typing support: `Mount types/shared in native fs`.
2. Call task in VS code: `Up dev`

If you want to develop inside a container

1. Call command in VS code: `Dev containers: Reopen in container`

## How to run psql

1. Call task in VS code: `psql dev`

## Endpoint to execute mock

<http://localhost/api/mock/execute?mockScriptName=mockUserAndAdminAccessScope>

## TODO

- [ ] password recovery|reset

- [ ] connect testing libraries

- [ ] Move dependencies one level higher

- [ ] Merge typescript, prettier and eslint configs and place it in project root directory

- [ ] write script for getting sql from all migrations into one .sql file which then will be fed to dbml documentation generator

- [ ] add healthcheck

- [ ] wrap mock into transaction

- [ ] add removing expired tokens from whitelisted store

- [ ] add redis as session token store

- [ ] update customFetch in frontend to use latest version made in tda project

- [ ] make universal data repo and way of typing so it will require to initialize this.repo only once in constructor
