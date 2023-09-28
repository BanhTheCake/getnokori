FROM node:18.15-slim

LABEL Name=nokori-api

WORKDIR /usr/src

ARG NODE_ENV=production

COPY . /usr/src

RUN npm install -g tsx
RUN npm install

EXPOSE 4777
CMD ["tsx", "src/index.ts"]
