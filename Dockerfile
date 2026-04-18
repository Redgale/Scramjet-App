FROM node:18-alpine

# 1. Install build essentials and pnpm
# Alpine needs these for certain JS packages that compile C++ code
RUN apk add --no-cache python3 make g++ && \
    npm install -g pnpm

WORKDIR /app

# 2. Copy dependency files first (better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# 3. Install dependencies using pnpm
# This ensures it respects your lockfile
RUN pnpm install --frozen-lockfile

# 4. Copy the rest of the source code
COPY . .

# 5. Koyeb/Production Setup
ENV NODE_ENV=production
# Koyeb usually expects port 8080 by default, ensure your src/index.js matches this
EXPOSE 8080

# 6. Execution
CMD ["node", "src/index.js"]