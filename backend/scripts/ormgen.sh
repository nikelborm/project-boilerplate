echo -e '\normgen script\n';

echo -e '\ninner call of recreate.sh started\n';
. ./recreate.sh
echo -e '\ninner call of recreate.sh finished\n';

echo;
read -p "Enter migration name: " migration_name;

echo -e '\nmigration:generate \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:generate -p src/modules/infrastructure/migration/$migration_name -d src/config/data-source;

echo -e '\napply rights to migration \n';
chown 1000:1000 src/modules/infrastructure/migration/*

echo -e '\ninner call of migrate.sh started\n';
. ./migrate.sh
echo -e '\ninner call of migrate.sh finished\n';
