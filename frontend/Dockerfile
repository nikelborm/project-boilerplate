FROM nikelborm/node as dev_front

COPY ./frontend/package.json ./frontend/yarn.lock ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./
RUN yarn --network-timeout 600000

COPY ./frontend/config config/
COPY ./frontend/public public/
COPY ./frontend/scripts scripts/

# mount of src for live-reloading is happening in docker-compose file
# backendTypes should be mounted on os level with native mount command

ARG DEV_INNER_FRONTEND_DEBUGGER_PORT
EXPOSE ${DEV_INNER_FRONTEND_DEBUGGER_PORT}
ENV PORT=${DEV_INNER_FRONTEND_DEBUGGER_PORT}

CMD ["node", "scripts/start.js"]




FROM nikelborm/node as build

COPY ./frontend/package.json ./frontend/yarn.lock ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./
RUN yarn --production --network-timeout 600000 && yarn cache clean

COPY ./frontend/config config/
COPY ./frontend/public public/
COPY ./frontend/scripts scripts/

COPY ./frontend/src src/

# backendTypes inside docker container could have files, when we native mounted it, and it copied by previous command
# and also it could be empty when we didn't mount it natively and there will be only empty directory as mount point
# so I firstly delete either an empty folder or folder with files
RUN rm src/backendTypes

# and then we copy without any conflicts
COPY ./backend/src/types/shared/ src/backendTypes

ARG REACT_APP_NAME
RUN node scripts/build.js




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
