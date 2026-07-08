# ==============================================================================
# Production Dockerfile for MarketMind Frontend (Next.js)
# ==============================================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install development dependencies to run builds
RUN npm ci

# Copy full application code
COPY . .

# Run production build
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy next compiled static folder and settings files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npx", "next", "start"]
