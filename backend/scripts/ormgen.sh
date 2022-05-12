echo -e '\normgen script\n';
echo -e '\nls dist/modules/infrastructure/migration \n';
ls dist/modules/infrastructure/migration/;

echo -e '\nls src/modules/infrastructure/migration \n';
ls src/modules/infrastructure/migration/;

echo -e '\nbuild ts migration \n';
nest build

echo -e '\nschema:drop \n';
node --require ts-node/register ./node_modules/typeorm/cli.js schema:drop -d src/config/data-source;

echo -e '\nmigration:run \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

echo;
read -p "Enter migation name: " migration_name;

echo -e '\nmigration:generate \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:generate -p src/modules/infrastructure/migration/$migration_name -d src/config/data-source;

echo -e '\napply rights to migration \n';
chown 1000:1000 src/modules/infrastructure/migration/*

echo -e '\nbuild ts migration \n';
nest build

echo -e '\napply new migration \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

echo -e '\nls dist/modules/infrastructure/migration \n';
ls dist/modules/infrastructure/migration/

echo -e '\nls src/modules/infrastructure/migration \n';
ls src/modules/infrastructure/migration/
