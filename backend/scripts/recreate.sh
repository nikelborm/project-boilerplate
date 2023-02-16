echo -e '\nrecreate db script\n';

echo -e '\ninner call of drop.sh started\n';
. ./scripts/drop.sh
echo -e '\ninner call of drop.sh finished\n';

echo -e '\ninner call of migrate.sh started\n';
. ./scripts/migrate.sh
echo -e '\ninner call of migrate.sh finished\n';
