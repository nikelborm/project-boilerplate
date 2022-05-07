FROM node:16-alpine

RUN mkdir /usr/local/sbin; ln -n /usr/local/bin/node /usr/local/sbin/node;chmod -R a+rwx /usr/local/bin;chmod -R a+rwx /usr/local/sbin; ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ENV PATH $PATH:/app/node_modules/.bin
WORKDIR /app
