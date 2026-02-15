FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Expo / Metro ports
EXPOSE 8081 19000 19001 19002

# Use --host lan so devices can connect (often needed)
CMD ["npx", "expo", "start", "--host", "lan", "--port", "8081"]