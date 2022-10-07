echo -e '\nrecreate db script\n';
echo -e '\nls dist/modules/infrastructure/migration \n';
ls dist/modules/infrastructure/migration/;

echo -e '\nls src/modules/infrastructure/migration \n';
ls src/modules/infrastructure/migration/;

echo -e '\nschema:drop \n';
node --require ts-node/register ./node_modules/typeorm/cli.js schema:drop -d src/config/data-source;

echo -e '\nbuild ts migration \n';
nest build

echo -e '\nmigration:run \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

echo -e '\nls dist/modules/infrastructure/migration \n';
ls dist/modules/infrastructure/migration/

echo -e '\nls src/modules/infrastructure/migration \n';
ls src/modules/infrastructure/migration/
