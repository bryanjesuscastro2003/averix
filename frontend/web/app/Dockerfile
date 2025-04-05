FROM node:18 

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm install -g vite

RUN npm install vite

COPY . .

CMD ["npm", "run", "dev"]



