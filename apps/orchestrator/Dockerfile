FROM node:20-bullseye-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/orchestrator/ ./apps/orchestrator/
COPY packages/database/ ./packages/database/
COPY packages/types/ ./packages/types/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/ ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app/apps/orchestrator
RUN pnpm build

CMD ["pnpm", "start"]
