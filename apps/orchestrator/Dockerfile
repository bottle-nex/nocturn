FROM node:20-bullseye-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/orchestrator ./apps/orchestrator
COPY packages/db ./packages/db

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/orchestrator
RUN pnpm build
CMD [ "pnpm", "start" ]

