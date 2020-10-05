FROM node:12.18-stretch

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
