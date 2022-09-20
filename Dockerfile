FROM node:18

WORKDIR /app

COPY package.json ./

COPY src ./src
COPY tsconfig.json ./
COPY .env ./
COPY sessions ./sessions

EXPOSE 80
ENV NODE_OPTIONS=--max_old_space_size=4096  

RUN npm install

RUN npm run build


COPY .env ./dist

CMD [ "npm", "run", "start" ]