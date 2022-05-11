echo -e 'schema:drop \n';

node --require ts-node/register ./node_modules/typeorm/cli.js schema:drop -d src/config/data-source;

echo -e 'migration:run \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

read -p "Enter migation name: " migration_name;

echo -e 'migration:generate \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:generate -p src/modules/infrastructure/migration/$migration_name -d src/config/data-source;
chown 1000:1000 src/modules/infrastructure/migration/*

echo -e 'apply new migration \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;
