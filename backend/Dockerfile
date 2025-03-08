FROM node:18.14.0

RUN node -v && npm -v

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 2567

CMD ["npx", "npm", "start"]

# utilisation : 
#    docker build -t colyseus-backend .
#    docker run -p 2567:2567 --name colyseus-container colyseus-backend
