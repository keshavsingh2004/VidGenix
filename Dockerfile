FROM node:18-alpine AS base
RUN apk add --no-cache ffmpeg
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production
CMD ["pnpm","run","start"]