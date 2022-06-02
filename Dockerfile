FROM node:16-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .
RUN yarn next telemetry disable
RUN yarn build
CMD yarn start
