# ---- Stage 1: build NestJS ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install deps (frozen lockfile = exact versions from pnpm-lock.yaml)
RUN pnpm install --frozen-lockfile

# Copy rest of source
COPY . .

# Build the NestJS app (outputs to dist/)
RUN pnpm run build

# ---- Stage 2: run NestJS ----
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only needed files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Expose port (Fly routes traffic here)
EXPOSE 3000

# Run NestJS server
CMD ["node", "dist/src/main.js"]