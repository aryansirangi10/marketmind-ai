# ==============================================================================
# Multi-Stage Production Dockerfile for MarketMind Backend
# ==============================================================================

# --- Stage 1: Build & Compile ---
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including devDependencies for compiling
RUN npm ci

# Copy source and database models
COPY src ./src
COPY prisma ./prisma

# Run Prisma schema generation
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Set production context
ENV NODE_ENV=production

# Copy manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy generated Prisma Client from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built dist files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5001

CMD ["npm", "run", "start"]
