FROM node:20-bullseye-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/ ./apps/server/
COPY packages/database/ ./packages/database/
COPY packages/types/ ./packages/types/
COPY packages/premium/ ./packages/premium/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/ ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app/apps/server
RUN pnpm build

EXPOSE 8080

CMD ["pnpm", "start"]
