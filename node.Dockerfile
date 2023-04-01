FROM node:18-alpine

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# this bullshit may be needed in case qemu going crazy when building arm64 containers
# RUN mkdir /usr/local/sbin; \
#   ln -n /usr/local/bin/node /usr/local/sbin/node; \
#   chmod -R a+rwx /tmp; \
#   chmod -R a+rwx /usr/local/bin/; \
#   chmod -R a+rwx /usr/local/sbin/; \
#   ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone;

ENV PATH $PATH:/app/node_modules/.bin

WORKDIR /app

# for future dependencies installation
# comand to check where is yarn cache docker run -it node:18-alpine yarn cache dir

# https://stackoverflow.com/a/14841880
# comand to check where is yarn cache docker run -it node:18-alpine npm config get cache

# RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile --production

# sharing=private was set intentionally because yarn override caches and two parallel yarn installs break each other
# https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/reference.md#run---mounttypecache
