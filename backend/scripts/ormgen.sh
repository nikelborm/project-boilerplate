#!/bin/sh -eux
echo -e '\normgen script\n';

echo -e '\ninner call of recreate.sh started\n';
. ./scripts/recreate.sh
echo -e '\ninner call of recreate.sh finished\n';

echo;
read -p "Enter migration name: " migration_name;

echo -e '\nmigration:generate \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:generate -p src/infrastructure/database/migration/$migration_name -d src/config/data-source;

echo -e '\napply rights to migration \n';
chown 1000:1000 src/infrastructure/database/migration/*

echo -e '\ninner call of migrate.sh started\n';
. ./scripts/migrate.sh
echo -e '\ninner call of migrate.sh finished\n';
