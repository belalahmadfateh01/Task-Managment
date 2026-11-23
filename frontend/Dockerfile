FROM node:22-bookworm-slim AS build

WORKDIR /app
ARG BACKEND_URL=http://api:3001
ENV BACKEND_URL=${BACKEND_URL}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
