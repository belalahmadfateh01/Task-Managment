FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY db ./db
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/server.js"]
