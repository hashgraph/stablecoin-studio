# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:24-alpine AS dependencies

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./

# Copy all workspace package.json files (required by npm workspaces)
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/sdk/package.json packages/sdk/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY apps/backend/package.json apps/backend/package.json

RUN npm ci

# ============================================
# Stage 2: Build contracts, SDK, and web app
# ============================================
FROM dependencies AS builder

# Copy contracts source
COPY packages/contracts/ packages/contracts/

# Copy SDK source
COPY packages/sdk/ packages/sdk/

# Copy web source
COPY apps/web/ apps/web/


# Build-time environment variables (REACT_APP_* are baked into the bundle)
# Required - pass via: docker build --build-arg REACT_APP_FACTORIES=...
ARG REACT_APP_FACTORIES
ARG REACT_APP_RESOLVERS
ARG REACT_APP_MIRROR_NODE
ARG REACT_APP_RPC_NODE
ARG REACT_APP_CONSENSUS_NODES

# Optional — override if needed
ARG REACT_APP_LOG_LEVEL=ERROR
ARG REACT_APP_BACKEND_URL
ARG GENERATE_SOURCEMAP=false
ARG REACT_APP_SHOW_CONFIG=true
ARG REACT_APP_PROJECT_ID
ARG REACT_APP_DAPP_NAME='Hedera Stablecoin'
ARG REACT_APP_DAPP_DESCRIPTION='StableCoin is a decentralized stablecoin platform built on Hedera Hashgraph.'
ARG REACT_APP_DAPP_URL
ARG REACT_APP_DAPP_ICONS

# Build in order: contracts -> sdk -> web
RUN npm run build --workspace=packages/contracts && \
    npm run build --workspace=packages/sdk && \
    npm run build --workspace=apps/web

# ============================================
# Stage 3: Production (nginx)
# ============================================
FROM nginx:alpine

COPY --from=builder /app/apps/web/build /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid


USER 101

EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]
