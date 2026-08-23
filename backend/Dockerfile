FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

# We use tsx to run the typescript code directly
CMD ["npx", "tsx", "src/index.ts"]
