FROM nikelborm/node as prepare

COPY package.json yarn.lock .eslintrc.json .prettierrc tsconfig.json ./

RUN yarn

COPY config config/
COPY public public/
COPY scripts scripts/
COPY src src/

FROM prepare as rundev
EXPOSE 3000
CMD ["yarn", "start"]

FROM prepare as build
RUN yarn build

FROM nginx:1.18.0-alpine as static
ARG PROD_EXTERNAL_NGINX_HTTP_PORT
ARG PROD_EXTERNAL_NGINX_HTTPS_PORT
EXPOSE ${PROD_EXTERNAL_NGINX_HTTP_PORT}
EXPOSE ${PROD_EXTERNAL_NGINX_HTTPS_PORT}
RUN rm -rf /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY .htpasswd /etc/nginx/.htpasswd
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY prod.nginx.template.conf /etc/nginx/templates/default.conf
COPY --from=build /app/build /usr/share/nginx/html/
