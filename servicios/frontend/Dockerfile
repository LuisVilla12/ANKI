FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# Copia TODO el contenido del proyecto (incluyendo vite.config.js)
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
