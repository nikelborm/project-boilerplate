# please remember that context of this Dockerfile is project root
# so you need to add ./backend/ prefix to file names

FROM nikelborm/node as prepare

COPY ./backend/package.json ./backend/yarn.lock ./backend/tsconfig.json ./backend/.prettierrc ./backend/tsconfig.build.json ./backend/.eslintrc.js ./

COPY ./backend/scripts scripts/



FROM prepare as production
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --production

COPY ./backend/src /app/src/

# we should copy it even if it is mounted natively. */src/types/shared (all mounted copies, not original WORKSPACE_DIR/shared) is in .dockerignore
# so when we are forming docker build context */src/types/shared will be ignored and we have to copy it from original WORKSPACE_DIR/shared
COPY ./shared/ /app/src/types/shared

RUN nest build

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

# TODO добавить вызов миграции на проде . ./scripts/migrate.sh
CMD [ "node", "dist/main" ]



FROM prepare as development
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000

# src and types/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

ARG DEV_BACKEND_DEBUGGER_PORT
EXPOSE ${DEV_BACKEND_DEBUGGER_PORT}

CMD . ./scripts/migrate.sh && nest start --debug 0.0.0.0:${DEV_BACKEND_DEBUGGER_PORT} --watch
