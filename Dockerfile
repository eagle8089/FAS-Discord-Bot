FROM node:22-slim

WORKDIR /app

COPY ./package*.json .
RUN npm install
COPY index.js .
COPY ./buttons ./buttons
COPY ./commands ./commands
COPY ./events ./events
COPY ./utils ./utils

CMD ["npm", "run", "start"]
