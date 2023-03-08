# please remember that context of this Dockerfile is project root
# so you need to add ./frontend/ prefix to file names

FROM nikelborm/node as prepare_front

COPY ./frontend/package.json ./frontend/yarn.lock ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./
COPY ./frontend/public public/
COPY ./frontend/config-overrides config-overrides/



FROM prepare_front as dev_front

# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile

# src and [types|tools]/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG INNER_DEV_FRONT_LIVE_RELOAD_SERVER_PORT
EXPOSE ${INNER_DEV_FRONT_LIVE_RELOAD_SERVER_PORT}
ENV PORT=${INNER_DEV_FRONT_LIVE_RELOAD_SERVER_PORT}

CMD ["yarn", "start"]




FROM prepare_front as build

# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile --production

COPY ./frontend/src /app/src/

# we should copy DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared even if they are mounted natively
# Because pathes of possibly mounted dirs (WORKSPACE_DIR/[frontend|backend]/src/[types|tools]/shared) were added to .dockerignore
# as a conseqence DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared will be empty in docker context
COPY ./shared/src/types/shared /app/src/types/shared
COPY ./shared/src/tools/shared /app/src/tools/shared

ARG REACT_APP_NAME
ENV REACT_APP_NAME=${REACT_APP_NAME}
RUN yarn build




FROM nginx:1.18.0-alpine as default_nginx

ARG INNER_NGINX_HTTP_PORT
EXPOSE ${INNER_NGINX_HTTP_PORT}
RUN rm -rf /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./frontend/.htpasswd /etc/nginx/.htpasswd




FROM default_nginx as prod_nginx_with_front_static

ARG INNER_NGINX_HTTPS_PORT
EXPOSE ${INNER_NGINX_HTTPS_PORT}
COPY ./frontend/prod.nginx.template.conf /etc/nginx/templates/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html/




FROM default_nginx as dev_nginx

COPY ./frontend/dev.nginx.template.conf /etc/nginx/templates/nginx.conf.template
