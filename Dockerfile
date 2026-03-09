FROM node:20

WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
