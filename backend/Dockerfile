FROM nikelborm/node as prepare

COPY package.json yarn.lock tsconfig.json .prettierrc tsconfig.build.json .eslintrc.js ./

RUN yarn --production

COPY src src/
COPY scripts scripts/



FROM prepare as production

RUN nest build

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

CMD [ "node", "dist/main" ]



FROM prepare as development

ARG INNER_BACKEND_HTTP_SERVER_PORT
EXPOSE ${INNER_BACKEND_HTTP_SERVER_PORT}

ARG INNER_BACKEND_WS_SERVER_PORT
EXPOSE ${INNER_BACKEND_WS_SERVER_PORT}

ARG DEV_BACKEND_DEBUGGER_PORT
EXPOSE ${DEV_BACKEND_DEBUGGER_PORT}

CMD . ./scripts/migrate.sh && nest start --debug 0.0.0.0:${DEV_BACKEND_DEBUGGER_PORT} --watch
