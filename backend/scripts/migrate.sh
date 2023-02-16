echo -e '\nmigrate script\n';
echo -e '\nls dist/modules/infrastructure/migration \n';
ls dist/modules/infrastructure/migration/;

echo -e '\nls src/modules/infrastructure/migration \n';
ls src/modules/infrastructure/migration/;

echo -e '\nbuild ts migration \n';
rm dist/modules/infrastructure/migration/*
nest build

echo -e '\napply new migration \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

echo -e '\nls dist/modules/infrastructure/migration \n';
ls dist/modules/infrastructure/migration/

echo -e '\nls src/modules/infrastructure/migration \n';
ls src/modules/infrastructure/migration/
