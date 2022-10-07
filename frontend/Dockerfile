FROM nikelborm/node as prepare

COPY ./frontend/package.json ./frontend/yarn.lock ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./

COPY ./frontend/config config/
COPY ./frontend/public public/
COPY ./frontend/scripts scripts/





FROM prepare as dev_front

ARG DEV_INNER_FRONTEND_DEBUGGER_PORT
EXPOSE ${DEV_INNER_FRONTEND_DEBUGGER_PORT}
ENV PORT=${DEV_INNER_FRONTEND_DEBUGGER_PORT}

RUN yarn --network-timeout 600000
CMD ["node", "scripts/start.js"]




FROM prepare as build

RUN yarn --production --network-timeout 600000 && yarn cache clean
COPY ./frontend/src src/
RUN rm src/backendTypes
COPY ./backend/src/types/shared/ src/backendTypes
RUN node scripts/build.js




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
