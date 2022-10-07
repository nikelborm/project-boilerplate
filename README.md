# project-boilerplate

## Requirements

1. Install docker
2. Install docker-compose
3. Run VS code task: `Create new docker builder` (call only once when pulling project). Command could be also found in `./.vscode/tasks.json`
4. `yarn` inside ./backend
5. `yarn` inside ./frontend

## Installation

1. `yarn mount` to mount backendTypes into front for better VS code support
2. Call task in VS code: `Up dev`. Command could be also found in `./.vscode/tasks.json`

## TODO

[ ] password recovery|reset

[ ] connect testing libraries

[ ] add healthcheck

[ ] add removing expired tokens from whitelisted store

[ ] add redis as session token store
