FROM node:23-slim

WORKDIR /app

COPY ./package*.json .
RUN npm install
COPY index.js .
COPY ./commands ./commands
COPY ./utils ./utils

# For Azure Web Apps Health Check

RUN apt-get update && apt-get install mini-httpd -y

COPY ./entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 80/tcp

CMD ["./entrypoint.sh"]
