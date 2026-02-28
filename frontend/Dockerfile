FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files and install as root
COPY package.json package-lock.json* ./
RUN npm install

# Copy app and build
COPY . .
RUN npm run build

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

CMD ["npm", "start"]
