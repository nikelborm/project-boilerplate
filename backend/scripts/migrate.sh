echo -e '\nmigrate script\n';
echo -e '\nls dist/infrastructure/migration \n';
ls dist/infrastructure/migration/;

echo -e '\nls src/infrastructure/migration \n';
ls src/infrastructure/migration/;

echo -e '\nbuild ts migration \n';
nest build

echo -e '\napply new migration \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

echo -e '\nls dist/infrastructure/migration \n';
ls dist/infrastructure/migration/

echo -e '\nls src/infrastructure/migration \n';
ls src/infrastructure/migration/
