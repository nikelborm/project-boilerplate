echo 'asdasd';

node --require ts-node/register ./node_modules/typeorm/cli.js schema:drop -d src/config/data-source;

node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;

read -p "Enter migation name: " migration_name;

cat src/modules/infrastructure/model/user.model.ts
cat src/modules/infrastructure/model/accessScope.model.ts
node --require ts-node/register ./node_modules/typeorm/cli.js migration:generate -p src/modules/infrastructure/migration/$migration_name -d src/config/data-source;
chown 1000:1000 src/modules/infrastructure/migration/*
