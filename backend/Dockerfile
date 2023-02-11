# please remember that context of this Dockerfile is project root
# so you need to add ./backend/ prefix to file names

FROM nikelborm/node as prepare

COPY ./backend/package.json ./backend/yarn.lock ./backend/tsconfig.json ./backend/.prettierrc ./backend/tsconfig.build.json ./backend/.eslintrc.js ./

COPY ./backend/scripts scripts/



FROM prepare as production

RUN yarn --production --network-timeout 600000 && yarn cache clean

COPY ./backend/src src/

# if we WILL NOT mount types/shared/ natively before building docker container
# then initial fs will have WORKSPACE_DIR/backend/src/types/shared/ dir with mounted files from real WORKSPACE_DIR/shared/
# then /app/src/types/shared/ dir in container's fs (after copying WORKSPACE_DIR/backend/src/ dir from local fs) WILL HAVE FILES

# if we WILL mount types/shared/ natively before building docker container
# then initial fs will have empty WORKSPACE_DIR/backend/src/types/shared/ dir
# then /app/src/types/shared/ dir in container's fs (after copying WORKSPACE_DIR/backend/src/ dir from local fs) WILL BE EMPTY DIR

# in both cases I firstly delete either an empty folder or folder with files
RUN rm -rf /app/src/types/shared

# and then I copy types/shared without any conflicts
COPY ./shared/ /app/src/types/shared

RUN nest build

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

# TODO добавить вызов миграции на проде . ./scripts/migrate.sh
CMD [ "node", "dist/main" ]



FROM prepare as development
RUN yarn --network-timeout 600000

# src and types/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

ARG DEV_BACKEND_DEBUGGER_PORT
EXPOSE ${DEV_BACKEND_DEBUGGER_PORT}

CMD . ./scripts/migrate.sh && nest start --debug 0.0.0.0:${DEV_BACKEND_DEBUGGER_PORT} --watch
