FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

ENV BACKEND_URL=back-team3.rozvictor.fr

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]