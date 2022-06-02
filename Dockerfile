FROM node:16-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

RUN yarn next telemetry disable
COPY . .
RUN yarn build

CMD yarn start
