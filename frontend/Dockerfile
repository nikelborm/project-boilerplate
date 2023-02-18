# please remember that context of this Dockerfile is project root
# so you need to add ./frontend/ prefix to file names

FROM nikelborm/node as prepare_front

COPY ./frontend/package.json ./frontend/yarn.lock ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./
COPY ./frontend/public public/



FROM prepare_front as dev_front

# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile

# src and types/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG DEV_INNER_FRONTEND_DEBUGGER_PORT
EXPOSE ${DEV_INNER_FRONTEND_DEBUGGER_PORT}
ENV PORT=${DEV_INNER_FRONTEND_DEBUGGER_PORT}

CMD ["yarn", "start"]




FROM prepare_front as build

# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile --production

COPY ./frontend/src /app/src/
# we should copy ./shared/ even if it is mounted natively. */src/types/shared (all mounted copies, not original WORKSPACE_DIR/shared) is in .dockerignore
# so when we are forming docker build context */src/types/shared will be ignored and we have to copy it from original WORKSPACE_DIR/shared
COPY ./shared/ /app/src/types/shared

ARG REACT_APP_NAME
ENV REACT_APP_NAME=${REACT_APP_NAME}
RUN yarn build




FROM nginx:1.18.0-alpine as default_nginx

EXPOSE 80
RUN rm -rf /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./frontend/.htpasswd /etc/nginx/.htpasswd




FROM default_nginx as prod_nginx_with_front_static

EXPOSE 443
COPY ./frontend/prod.nginx.template.conf /etc/nginx/templates/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html/




FROM default_nginx as dev_nginx

COPY ./frontend/dev.nginx.template.conf /etc/nginx/templates/nginx.conf.template
