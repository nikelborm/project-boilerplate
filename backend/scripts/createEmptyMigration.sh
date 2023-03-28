#!/usr/bin/env bash
echo;
read -p "Enter migration name: " migration_name;

node --require ts-node/register ./node_modules/typeorm/cli.js migration:create src/infrastructure/database/migration/$migration_name;
