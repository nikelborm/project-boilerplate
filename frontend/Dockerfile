FROM node:16-alpine AS prepare

RUN mkdir /usr/local/sbin; ln -n /usr/local/bin/node /usr/local/sbin/node || true

ENV TZ=Europe/Moscow
# ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
# ENV REACT_APP_NAME=NewApp
# ENV GENERATE_SOURCEMAP=false
ENV PATH $PATH:/app/node_modules/.bin
WORKDIR /app

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

COPY package.json yarn.lock .eslintrc.json .prettierrc tsconfig.json ./

RUN yarn

COPY config config/
COPY public public/
COPY scripts scripts/
COPY src src/

FROM prepare as rundev
CMD ["yarn", "start"]
EXPOSE 3000

FROM prepare as build
RUN yarn build

FROM nginx:1.18.0-alpine as static
ENV TZ=Europe/Moscow
RUN rm -rf /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY .htpasswd /etc/nginx/.htpasswd
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html/
EXPOSE 8000
