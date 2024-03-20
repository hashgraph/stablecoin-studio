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

# Copy source code into app folder
COPY . .

# Install dependencies
#RUN npm ci

# Set Docker as a non-root user
#USER node

#CMD ["node", "dist/main.js"]