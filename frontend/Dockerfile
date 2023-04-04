# please remember that context of this Dockerfile is project root
# so you need to add ./frontend/ prefix to file names

FROM nikelborm/node as prepare_front_with_deps

COPY ./frontend/package.json ./frontend/yarn.lock ./
# see node.Dockerfile for this RUN details
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=private yarn install --network-timeout 600000 --frozen-lockfile
# I intentionally removed entire stage (which is dumb copy) with --production to reuse cache of development inside prod builds
COPY ./frontend/.eslintrc.json ./frontend/.prettierrc ./frontend/tsconfig.json ./frontend/next-env.d.ts ./frontend/next.config.js ./
COPY ./frontend/public public/




FROM prepare_front_with_deps as messy_build_folder

COPY ./frontend/src /app/src/

# we should copy DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared even if they are mounted natively
# Because pathes of possibly mounted dirs (WORKSPACE_DIR/[frontend|backend]/src/[types|tools]/shared) were added to .dockerignore
# as a conseqence DOCKER_CONTEXT_DIR/[frontend|backend]/src/[types|tools]/shared will be empty in docker context
COPY ./shared/src/types/shared /app/src/types/shared
COPY ./shared/src/tools/shared /app/src/tools/shared

ARG REACT_APP_NAME
ENV REACT_APP_NAME=${REACT_APP_NAME}

ENV NEXT_TELEMETRY_DISABLED 1

# dont try to cache .next folder as you cache yarn
# it will make some shit with static files, so further build stages will fail idk why


RUN yarn build




FROM nginx:1.18.0-alpine as default_nginx

ARG INNER_NGINX_HTTP_PORT
EXPOSE ${INNER_NGINX_HTTP_PORT}
RUN rm -rf /usr/share/nginx/html; \
    rm /etc/nginx/conf.d/*
COPY ./frontend/.htpasswd /etc/nginx/.htpasswd




FROM default_nginx as prod_nginx_with_front_static

# ARG INNER_NGINX_HTTPS_PORT
# EXPOSE ${INNER_NGINX_HTTPS_PORT}
COPY ./frontend/prod.nginx.template.conf /etc/nginx/templates/nginx.conf.template
# COPY --from=build /app/build /usr/share/nginx/html/
# TODO: Move static files to volume, share it between nginx and frontend prod (in case frontend prod will want to rebuild using ISR)
# https://github.com/vercel/next.js/blob/canary/docs/deployment.md




FROM default_nginx as dev_nginx

COPY ./frontend/dev.nginx.template.conf /etc/nginx/templates/nginx.conf.template





FROM prepare_front_with_deps as next_dev_front

# src and [types|tools]/shared are both bind-mounted in docker-compose file before running CMD
# there is no need to copy src before running CMD https://stackoverflow.com/questions/69308389/docker-is-volume-mounted-before-running-cmd

ARG INNER_DEV_FRONT_LIVE_RELOAD_SERVER_PORT
EXPOSE ${INNER_DEV_FRONT_LIVE_RELOAD_SERVER_PORT}
ENV PORT=${INNER_DEV_FRONT_LIVE_RELOAD_SERVER_PORT}

CMD ["yarn", "dev"]




FROM nikelborm/node as next_prod_front

RUN addgroup -g 1001 -S nodejs; \
    adduser -S nextjs -u 1001

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# https://github.com/vercel/next.js/blob/canary/examples/with-docker-multi-env/docker/production/Dockerfile
COPY --from=messy_build_folder --chown=nextjs:nodejs /app/public/ ./public/
COPY --from=messy_build_folder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=messy_build_folder --chown=nextjs:nodejs /app/.next/static/ ./.next/static/

USER nextjs

ARG INNER_NEXT_HTTP_PORT
EXPOSE ${INNER_NEXT_HTTP_PORT}
ENV PORT=${INNER_NEXT_HTTP_PORT}

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
