From node:20-alpine

WORKDIR /app

copy package*.json ./

RUN npm intall

COPY . /app

EXPOSE 3000

CMD ["npm","run","dev"]