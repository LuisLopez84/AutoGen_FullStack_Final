FROM node:20
WORKDIR /app
ENV npm_config_optional=false
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host"]
