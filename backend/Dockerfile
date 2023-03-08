# please remember that context of this Dockerfile is project root
# so you need to add ./backend/ prefix to file names

FROM nikelborm/node as prepare

COPY ./backend/package.json ./backend/yarn.lock ./backend/tsconfig.json ./backend/tsconfig.build.json ./backend/.prettierrc ./backend/.eslintrc.js ./backend/nest-cli.json ./

COPY ./backend/scripts scripts/



FROM prepare as production
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile --production

COPY ./backend/src/ /app/src/

# we should copy DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared even if they are mounted natively
# Because pathes of possibly mounted dirs (WORKSPACE_DIR/[frontend|backend]/src/[types|tools]/shared) were added to .dockerignore
# as a conseqence DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared will be empty in docker context
COPY ./shared/src/types/shared/ /app/src/types/shared/
COPY ./shared/src/tools/shared/ /app/src/tools/shared/

RUN nest build

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

# TODO добавить вызов миграции на проде . ./scripts/migrate.sh
CMD [ "node", "dist/main" ]



FROM prepare as development
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile

# src and [types|tools]/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

ARG DEV_BACKEND_DEBUGGER_PORT
EXPOSE ${DEV_BACKEND_DEBUGGER_PORT}

CMD . ./scripts/migrate.sh && nest start --debug 0.0.0.0:${DEV_BACKEND_DEBUGGER_PORT} --watch
