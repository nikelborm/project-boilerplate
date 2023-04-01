# please remember that context of this Dockerfile is project root
# so you need to add ./backend/ prefix to file names


FROM nikelborm/node as prepare_back_dev_deps

COPY ./backend/package.json ./backend/yarn.lock ./
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile
COPY ./backend/tsconfig.json ./backend/tsconfig.build.json ./backend/.prettierrc ./backend/.eslintrc.js ./backend/nest-cli.json ./
COPY ./backend/scripts scripts/


FROM nikelborm/node as prepare_back_prod_deps

COPY ./backend/package.json ./backend/yarn.lock ./
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile --production
COPY ./backend/tsconfig.json ./backend/tsconfig.build.json ./backend/.prettierrc ./backend/.eslintrc.js ./backend/nest-cli.json ./
COPY ./backend/scripts scripts/



FROM prepare_back_prod_deps as prepare_back_prod_deps_and_source

COPY ./backend/src/ /app/src/

# we should copy DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared even if they are mounted natively
# Because pathes of possibly mounted dirs (WORKSPACE_DIR/[frontend|backend]/src/[types|tools]/shared) were added to .dockerignore
# as a conseqence DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared will be empty in docker context
COPY ./shared/src/types/shared/ /app/src/types/shared/
COPY ./shared/src/tools/shared/ /app/src/tools/shared/





FROM prepare_back_prod_deps_and_source as messy_production

RUN nest build; \
  ./node_modules/.bin/ncc build ./dist/main.js -o ./dist2 --no-source-map-register --minify --no-cache



FROM nikelborm/node as production

RUN addgroup -g 1001 -S nodejs; \
    adduser -S nestjs -u 1001

COPY --from=messy_production --chown=nestjs:nodejs /app/dist2 /app/dist

USER nestjs

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

CMD [ "node", "dist/index.js" ]



FROM prepare_back_prod_deps_and_source as migration_container

CMD ["/bin/sh", "-c", "exec /bin/sh -c 'trap : TERM INT; sleep 9999999999d & wait'"]



FROM prepare_back_dev_deps as development

# src and [types|tools]/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

ARG DEV_BACKEND_DEBUGGER_PORT
EXPOSE ${DEV_BACKEND_DEBUGGER_PORT}

CMD . ./scripts/migrate.sh && nest start --debug 0.0.0.0:${DEV_BACKEND_DEBUGGER_PORT} --watch
