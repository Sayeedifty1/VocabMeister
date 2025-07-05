#!/bin/bash

echo "🚀 Deploying Vocabulary App Backend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login first:"
    vercel login
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your API should be available at the URL shown above"
echo "📝 Don't forget to set your environment variables in the Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - SESSION_SECRET"
echo "   - FRONTEND_URL"
echo "   - NODE_ENV=production" 