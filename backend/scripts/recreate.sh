node --require ts-node/register ./node_modules/typeorm/cli.js schema:drop -d src/config/data-source;
node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source;
