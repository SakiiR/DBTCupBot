ARG APP_DIR="/usr/src/app"

# Build stage
FROM node:16.6.0 AS build
ARG APP_DIR

RUN mkdir -p "${APP_DIR}" && cd "${APP_DIR}"

WORKDIR $APP_DIR

# COPY useful files
COPY package.json "${APP_DIR}/"
COPY yarn.lock "${APP_DIR}/"

RUN yarn

COPY src "${APP_DIR}/src"
COPY quasar.conf.js "${APP_DIR}/"
COPY babel.config.js "${APP_DIR}/"
COPY jsconfig.json "${APP_DIR}/"
COPY .postcssrc.js "${APP_DIR}/"
COPY .eslintrc.js "${APP_DIR}/"
COPY .eslintignore "${APP_DIR}/"

RUN yarn build

# Run stage
FROM nginx:latest AS run
ARG APP_DIR

COPY --from=0 "${APP_DIR}/dist/spa" "/usr/share/nginx/html"
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY public/ /usr/share/nginx/html

ARG API_HOST

RUN sed -i "s/{{API\_HOST}}/${API_HOST}/g"  /etc/nginx/conf.d/default.conf 
