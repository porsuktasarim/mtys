FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN mkdir -p uploads/temp uploads/hayvan uploads/parsel uploads/gorevli

EXPOSE 3000

CMD ["node", "backend/server.js"]
