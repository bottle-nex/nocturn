FROM node:20-bullseye-slim

WORKDIR /app

COPY package.json yarn.lock turbo.json ./
COPY apps/orchestrator ./apps/orchestrator
COPY packages/db ./packages/db

RUN echo '{"name": "orchestrator-docker", "private": true, "workspaces": ["apps/orchestrator", "packages/*"]}' > package.json
RUN yarn --frozen-lockfile

WORKDIR /app/apps/orchestrator
RUN yarn build
CMD [ "yarn", "start" ]

