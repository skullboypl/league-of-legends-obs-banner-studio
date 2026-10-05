# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine

# Nginx serves the Studio and proxies /api to the protected Riot API process.
RUN apk add --no-cache nodejs

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY server /app/server
COPY --from=build /app/node_modules /app/node_modules
COPY package.json /app/package.json

EXPOSE 80

CMD ["sh", "-c", "node /app/server/index.mjs & exec nginx -g 'daemon off;'"]
