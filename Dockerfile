FROM node:23-slim

WORKDIR /app

COPY ./package*.json .
RUN npm install
COPY index.js .
COPY ./commands ./commands
COPY ./utils ./utils

CMD ["npm", "run", "bot"]
