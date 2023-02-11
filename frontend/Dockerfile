# please remember that context of this Dockerfile is project root
# so you need to add ./frontend/ prefix to file names

FROM nikelborm/node as dev_front

COPY ./frontend/package.json ./frontend/yarn.lock ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./
RUN yarn --network-timeout 600000

COPY ./frontend/config config/
COPY ./frontend/public public/
COPY ./frontend/scripts scripts/

# src and types/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

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

# if we WILL NOT mount types/shared/ natively before building docker container
# then initial fs will have WORKSPACE_DIR/frontend/src/types/shared/ dir with mounted files from real WORKSPACE_DIR/shared/
# then /app/src/types/shared/ dir in container's fs (after copying WORKSPACE_DIR/frontend/src/ dir from local fs) WILL HAVE FILES

# if we WILL mount types/shared/ natively before building docker container
# then initial fs will have empty WORKSPACE_DIR/frontend/src/types/shared/ dir
# then /app/src/types/shared/ dir in container's fs (after copying WORKSPACE_DIR/frontend/src/ dir from local fs) WILL BE EMPTY DIR

# in both cases I firstly delete either an empty folder or folder with files
RUN rm -rf /app/src/types/shared

# and then I copy types/shared without any conflicts
COPY ./shared/ /app/src/types/shared

ARG REACT_APP_NAME
ENV REACT_APP_NAME=${REACT_APP_NAME}
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
