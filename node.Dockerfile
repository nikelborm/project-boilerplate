FROM node:16-alpine

RUN mkdir /usr/local/sbin; \
  ln -n /usr/local/bin/node /usr/local/sbin/node; \
  chmod -R a+rwx /tmp; \
  chmod -R a+rwx /usr/local/bin/; \
  chmod -R a+rwx /usr/local/sbin/; \
  ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone; \
  mkdir /usr/local/yarn-cache/;

ENV PATH $PATH:/app/node_modules/.bin
ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache

VOLUME /usr/local/yarn-cache

WORKDIR /app
