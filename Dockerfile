FROM node:14-alpine
WORKDIR /app
COPY package.json /app
RUN yarn install
COPY . /app
RUN yarn build
EXPOSE 8081
CMD yarn start