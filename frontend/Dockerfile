FROM nikelborm/node as prepare

COPY package.json yarn.lock .eslintrc.json .prettierrc tsconfig.json ./

RUN yarn --production

COPY config config/
COPY public public/
COPY scripts scripts/

FROM prepare as dev_front
ARG DEV_INNER_FRONTEND_DEBUGGER_PORT
EXPOSE ${DEV_INNER_FRONTEND_DEBUGGER_PORT}
ENV PORT=${DEV_INNER_FRONTEND_DEBUGGER_PORT}
CMD ["node", "scripts/start.js"]

FROM prepare as build
COPY src src/
RUN node scripts/build.js

FROM nginx:1.18.0-alpine as default_nginx
ARG INNER_NGINX_HTTP_PORT
EXPOSE ${INNER_NGINX_HTTP_PORT}
RUN rm -rf /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY .htpasswd /etc/nginx/.htpasswd

FROM default_nginx as prod_nginx_with_front_static
ARG INNER_NGINX_HTTPS_PORT
EXPOSE ${INNER_NGINX_HTTPS_PORT}
COPY prod.nginx.template.conf /etc/nginx/templates/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html/

FROM default_nginx as dev_nginx
COPY dev.nginx.template.conf /etc/nginx/templates/nginx.conf.template
