# project-boilerplate

## Requirements and initialization

If you don't have vs code, search for commands in `./project.code-workspace`

1. Install docker, docker-compose, buildx
2. Install node.js 16 with nvm. [NVM GitHub](https://github.com/nvm-sh/nvm)
3. Install yarn with `npm i -g yarn`
4. Call task in VS code: `Create new docker builder` (call only once when pulling project)
5. Call task in VS code: `Use docker builder` (call only once when pulling project)
6. Call task in VS code: `Install yarn dependencies` (call only once when pulling project)

## Development

If you plan to develop and use own fs

1. Call task in VS code for better typing support: `Mount types/shared in native fs`.
2. Call task in VS code: `Up dev`

If you want to develop inside a container

1. Call command in VS code: `Dev containers: Reopen in container`

## How to run psql

1. Call task in VS code: `psql dev`

## Endpoint to execute mock

<http://localhost/api/mock/execute?mockScriptName=mockUserAndAdminAccessScope>

## TODO

- [ ] password recovery|reset

- [ ] connect testing libraries

- [ ] Move dependencies one level higher

- [ ] Merge typescript, prettier and eslint configs and place it in project root directory

- [ ] write script for getting sql from all migrations into one .sql file which then will be fed to dbml documentation generator

- [ ] add healthcheck

- [ ] wrap mock into transaction

- [ ] add removing expired tokens from whitelisted store

- [ ] add redis as session token store

- [ ] update customFetch in frontend to use latest version made in tda project

- [ ] make universal data repo and way of typing so it will require to initialize this.repo only once in constructor

У нас есть неймспейс с **whitelist** где на каждом ключе есть экспайр который совпадает с экспайром даты токена
каждый ключ это uuid сессии, а каждое значение - это сам токен, который также содержит uuid сессии и айди пользователя которому выдан

У нас есть неймспейс с **blacklist** где на каждом ключе есть экспайр который совпадает с экспайром даты токена
каждый ключ это uuid сессии, а каждое значение - это сам токен, который также содержит uuid сессии и айди пользователя которому выдан

<!-- можно создать таблицу c парами sessionUUID: tokenPairSeedUUID -->

У нас есть несколько юз кейсов:

1. DONE Пользователь логинится
2. Пользователь регистрируется
   1. Создаётся случайный новый sessionUUID
   2. Создаётся случайный новый tokenPairSeedUUID
   3. Создаётся новый аксес токен с новым sessionUUID из `_.1.` и новым tokenPairSeedUUID из `_.2.`
   4. Создаётся новый рефреш токен с новым sessionUUID из `_.1.` и новым tokenPairSeedUUID из `_.2.`
3. Пользователь использует свой рефреш токен, продлевая сессию
   1. Валидируется рефреш токен (проверяется не истёк ли он, проверяется не лежит ли он в blacklist)
   2. Берётся старый sessionUUID
   3. Создаётся случайный новый tokenPairSeedUUID
   4. Создаётся новый аксес токен со старым sessionUUID из `_.2.` и новым tokenPairSeedUUID из `_.3.`
   5. Создаётся новый рефреш токен со старым sessionUUID из `_.2.` и новым tokenPairSeedUUID из `_.3.`
   6. `invalidateTokenPairSeed(старый tokenPairSeedUUID из рефреш токена)`
4. Пользователь выходит из аккаунта
   1. Валидируется рефреш токен `validateRefreshToken(refreshToken)` (именно рефреш потому что мы не хотим тратить время пользователя при выходе, особенно если пользователя взломали и он хочет как можно быстрее завершить сеанс)
   2. `invalidateTokenPairSeed(старый tokenPairSeedUUID из рефреш токена)`Берётся старый tokenPairSeedUUID из аксес токена
   3. Старый рефреш токен со старым tokenPairSeedUUID из `_.1.` становится невалидным
   4. Старый аксес токен со старым tokenPairSeedUUID из `_.1.` становится невалидным
   5. Старый tokenPairSeedUUID из `_.1.` становится невалидным
   6. Берётся старый sessionUUID
   7. Старый рефреш токен со старым sessionUUID из `_.5.` становится невалидным
   8. Старый аксес токен со старым sessionUUID из `_.5.` становится невалидным
   9. Старый sessionUUID из `_.5.` становится невалидным
5. Пользователь выходит из аккаунта на всех устройствах
   1. Валидируется рефреш токен (проверяется не истёк ли он, проверяется не лежит ли он в blacklist) (именно рефреш потому что мы не хотим тратить время пользователя при выходе, особенно если пользователя взломали и он хочет как можно быстрее завершить сеанс)
   2. Берётся userId из аксес токена
   3. Находим все пары sessionUUID:tokenPairSeedUUID в хранилище, у которых указан userId из `_.2.`
   4. Для каждой пары повторяем набор инструкций из `4.`
6. Админ извне обновляет права пользователя (добавляет или удаляет права) (все рефреш токены остаются валидными, все аксес токены становятся невалидными)
7. Аксес токен пользователя истекает по времени
8. Рефреш токен пользователя истекает по времени

store_1 whitelist + expire(refresh token ttl 7 days, update expire of row on every use of refreshToken)
   => userId: set(sessionUUID)

store_2 whitelist + expire(refresh token ttl 7 days, update expire of row on every use of refreshToken)
   => sessionUUID: hashset(
      access: tokenJSON
      refresh: tokenJSON
   )

1. логинится
   1. `HMSET ${ns2}:${sessionUUID} access ${accessToken} refresh ${refreshToken}`
   2. `expire ${ns2}:${sessionUUID} 604800`
   3. `SADD ${ns1}:${userId} ${sessionUUID}`
   4. `expire ${ns1}:${userId} 604800`
2. регистрируется
   1. `HMSET ${ns2}:${sessionUUID} access ${accessToken} refresh ${refreshToken}`
   2. `expire ${ns2}:${sessionUUID} 604800`
   3. `SADD ${ns1}:${userId} ${sessionUUID}`
   4. `expire ${ns1}:${userId} 604800`
3. использует рефреш токен
   1. <!-- exist ${ns2}:${sessionUUID} and  -->
   2. `if (HGET ${ns2}:${sessionUUID} refresh) === ${refreshToken} and SISMEMBER ${ns1}:${userId} ${sessionUUID} === 1, continue script`
   3. `HMSET ${ns2}:${sessionUUID} access ${accessToken} refresh ${refreshToken}`
   4. `expire ${ns2}:${sessionUUID} 604800`
4. пользователь выходит из аккаунта
   1. <!-- exist ${ns2}:${sessionUUID} and  -->
   2. `if (HGET ${ns2}:${sessionUUID} refresh) === ${refreshToken} and SISMEMBER ${ns1}:${userId} ${sessionUUID} === 1, continue script`
   3. `DEL ${ns2}:${sessionUUID}`
   4. `SREM ${ns1}:${userId} ${ns2}:${sessionUUID}`
5. Пользователь выходит из всех аккаунтов
   1. <!-- exist ${ns2}:${sessionUUID} and  -->
   2. `if (HGET ${ns2}:${sessionUUID} refresh) === ${refreshToken} and SISMEMBER ${ns1}:${userId} ${sessionUUID} === 1, continue script`
   3. `SMEMBERS ${ns1}:${userId} for each DEL ${ns2}:member.${sessionUUID}`
   4. `del ${ns1}:${userId}`
6. Пользователь делает запрос используя свой access
   1. <!-- exist ${ns2}:${sessionUUID} and  -->
   2. `if (HGET ${ns2}:${sessionUUID} access) === ${accessToken} and SISMEMBER ${ns1}:${userId} ${sessionUUID} === 1, continue script`
   3. ...
7. Админ извне обновляет права пользователя (добавляет или удаляет права) (все рефреш токены остаются валидными, все аксес токены становятся невалидными)
   1. <!-- exist ${ns2}:${sessionUUID} and  -->
   2. `if (HGET ${ns2}:${adminSessionUUID} access) === ${adminAccessToken} and SISMEMBER ${ns1}:${adminUserId} ${adminSessionUUID} === 1, continue script`
   3. `SMEMBERS ${ns1}:${regularUserId} for each (regularSessionUUID) => HDEL ${ns2}:${regularSessionUUID} access`
8. Аксес токен пользователя истекает по времени
9. Рефреш токен пользователя истекает по времени
10. Пользователь выходит на другом устройстве (по выбранному sessionUUID, удаляется пара токенов и удаляется сессия из сета)


<!-- 7 day = 60 * 60 * 24 * 7 = 604800 -->
<!-- 20 min = 60 * 20 = 1200 -->

<!-- https://www.tutorialspoint.com/redis/redis_sets.htm -->

lua scripting for getting all tokens by userId

<!-- local rank = redis.call('zrank', KEYS[1], ARGV[1]);
local min = math.max(rank - ARGV[2], 0);
local max = rank + ARGV[2];
local ldb = redis.call('zrange', KEYS[1], min, max);
return {rank+1, ldb}; -->
