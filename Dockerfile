# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NUXT_PUBLIC_API_BASE=http://localhost/api
ARG NUXT_PUBLIC_GOOGLE_AUTH_URL=
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_GOOGLE_AUTH_URL=$NUXT_PUBLIC_GOOGLE_AUTH_URL
ENV NODE_ENV=production

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3005

COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3005/ > /dev/null || exit 1

CMD ["node", ".output/server/index.mjs"]
