#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment for Pevzner Foundation App..."

# 1. Pull latest code safely
if [ -d ".git" ]; then
    echo "💾 Backing up database before deploy..."
    ./db-backup.sh 2>/dev/null || cp prisma/dev.db /tmp/dev.db.backup 2>/dev/null || true

    echo "📦 Pulling latest changes from git..."
    git fetch origin
    git reset --hard origin/main || echo "⚠️  Failed to reset, assuming no remote main branch"

    echo "💾 Restoring database..."
    cp /tmp/dev.db.backup prisma/dev.db 2>/dev/null || true
fi

# 2. Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# 3. Generate Prisma client and apply pending migrations
echo "🗄️ Applying database migrations..."
npx prisma generate
npx prisma migrate deploy

# 4. Clean cache and Build Next.js application
echo "🧹 Cleaning previous build cache..."
rm -rf .next

echo "🔨 Building Next.js app..."
npm run build

# 5. Start or update PM2 process on port 3008
APP_NAME="pevzner-app"
PORT=3008

echo "🔄 Deleting old PM2 instances of '$APP_NAME'..."
pm2 delete "$APP_NAME" 2>/dev/null || true

echo "🚀 Starting PM2 process '$APP_NAME' on port $PORT..."
PORT=$PORT pm2 start npm --name "$APP_NAME" -- start

pm2 save

echo "✅ Deployment successful! App is running on port $PORT."
