FROM node:20-bullseye-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/ ./apps/server/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/server
RUN pnpm build

EXPOSE 8080

CMD ["pnpm", "start"]