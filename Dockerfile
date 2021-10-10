ARG APP_DIR="/usr/src/app"

# Build stage
FROM node:latest AS build
ARG APP_DIR

RUN mkdir -p "${APP_DIR}" && cd "${APP_DIR}"

WORKDIR $APP_DIR

# COPY useful files
COPY package.json "${APP_DIR}/"
COPY yarn.lock "${APP_DIR}/"

RUN yarn


COPY tsconfig.json "${APP_DIR}/"
COPY src "${APP_DIR}/src"

RUN yarn build

# Run stage
FROM node:latest AS run
ARG APP_DIR

RUN mkdir -p "${APP_DIR}" && cd "${APP_DIR}"

COPY --from=0 "${APP_DIR}/dist" "${APP_DIR}/"
COPY --from=0 "${APP_DIR}/node_modules" "${APP_DIR}/node_modules"
COPY --from=0 "${APP_DIR}/src/api/public" "${APP_DIR}/api/public"

RUN mkdir -p /data/cup-storage

CMD NODE_ENV=prod node "/usr/src/app/index.js"
