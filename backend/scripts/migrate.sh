#!/bin/sh -eux
echo -e '\nmigrate script\n';
# echo -e '\nls dist/infrastructure/database/migration \n';
# ls dist/infrastructure/database/migration/;

# echo -e '\nls src/infrastructure/database/migration \n';
# ls src/infrastructure/database/migration/;

echo -e '\nremove dist \n';
rm -rf ./dist

echo -e '\nbuild ts migration \n';
nest build

echo -e '\napply new migration \n';
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

# echo -e '\nls dist/infrastructure/database/migration \n';
# ls dist/infrastructure/database/migration/

# echo -e '\nls src/infrastructure/database/migration \n';
# ls src/infrastructure/database/migration/
