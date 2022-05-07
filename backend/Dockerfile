FROM nikelborm/node as prepare

COPY package.json yarn.lock tsconfig.json .prettierrc tsconfig.build.json .eslintrc.js ./

RUN yarn --production

COPY src src/

# FROM prepare as rundev
# EXPOSE 3000
# CMD ["yarn", "start"]

FROM prepare as production
RUN nest build
CMD [ "node", "dist/main" ]

# RUN npm run build

# CMD npm run migrate && exec npm run start:dev

# EXPOSE 3000

# FROM build as release

# RUN npm i --production

# RUN addgroup -S fntch && \
#     adduser -S -h /app -G fntch fntch
# RUN mkdir -p /app/.yarn /app/.cache/yarn && \
#      chown fntch:fntch /app/.yarn /app/.cache/yarn

# USER fntch
# CMD npm run migrate && exec node dist/main
# EXPOSE 3000






# # ! Important
# # Since we rely in our code to environment variables for e.g. db connection
# # this can only be run successfully with docker-compose file

# # Specify node version and choose image
# # also name our image as development (can be anything)
# FROM node:14 AS development

# # Specify our working directory, this is in our container/in our image
# WORKDIR /thomas/src/app

# # Copy the package.jsons from host to container
# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./

# # Here we install all the deps
# RUN npm install

# # Bundle app source / copy all other files
# COPY . .

# # Build the app to the /dist folder
# RUN npm run build

# ################
# ## PRODUCTION ##
# ################
# # Build another image named production
# FROM node:14 AS production

# # Set node env to prod
# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# # Set Working Directory
# WORKDIR /thomas/src/app

# # Copy all from development stage
# COPY --from=development /thomas/src/app/ .

# EXPOSE 8080

# # Run app
# CMD [ "node", "dist/main" ]

# # Example Commands to build and run the dockerfile
# # docker build -t thomas-nest .
# # docker run thomas-nest
