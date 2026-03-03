# Source: https://dawchihliou.github.io/articles/the-last-dockerfile-you-need-for-nestjs
# 🧑‍💻 Development
#
FROM node:20.11.1-alpine3.19 as development
# add the missing shared libraries from alpine base image
# RUN apk add --no-cache libc6-compat
# Create app folder
WORKDIR /app

# Set to development environment
ENV NODE_ENV development

# Create non-root user for Docker
# RUN addgroup --system --gid 1001 node
# RUN adduser --system --uid 1001 node

# Copy workspace root files
COPY --chown=node:node package*.json ./

# Install all workspace dependencies
RUN npm ci

# Copy backend source code
COPY --chown=node:node backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Set Docker as a non-root user
USER node

#
# 🏡 Production Build
#
FROM node:20.11.1-alpine3.19 as build

WORKDIR /app
# RUN apk add --no-cache libc6-compat

# Set to production environment
ENV NODE_ENV production

# Re-create non-root user for Docker
# RUN addgroup --system --gid 1001 node
# RUN adduser --system --uid 1001 node

# Copy workspace root files
COPY --chown=node:node package*.json ./

# Install all workspace dependencies
RUN npm ci

# Copy backend source code
COPY --chown=node:node backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Generate the production build. The build script runs "nest build" to compile the application.
RUN npm run build

# Install only the production dependencies and clean cache to optimize image size.
WORKDIR /app
RUN npm ci --production && npm cache clean --force

# Set Docker as a non-root user
USER node

#
# 🚀 Production Server
#
FROM node:20.11.1-alpine3.19 as production

WORKDIR /app
# RUN apk add --no-cache libc6-compat

# Set to production environment
ENV NODE_ENV production

# Re-create non-root user for Docker
# RUN addgroup --system --gid 1001 node
# RUN adduser --system --uid 1001 node

# Copy only the necessary files from backend build
COPY --chown=node:node --from=build /app/backend/dist dist
COPY --chown=node:node --from=build /app/node_modules node_modules

# Set Docker as non-root user
USER node

CMD ["node", "dist/main.js"]