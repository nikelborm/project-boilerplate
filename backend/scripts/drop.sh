echo -e '\ndrop db script\n';
echo -e '\nschema:drop \n';
node --require ts-node/register ./node_modules/typeorm/cli.js schema:drop -d src/config/data-source;
