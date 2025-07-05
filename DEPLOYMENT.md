# Vercel Deployment Guide

## Quick Deploy

1. **Push your code to GitHub**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory as the project root (not backend)

## Environment Variables

Set these in your Vercel project settings:

```bash
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database
SESSION_SECRET=your-super-secure-random-string
FRONTEND_URL=https://vocabmeister.vercel.app
NODE_ENV=production
```

## Project Structure

```
/
├── vercel.json          # Vercel configuration
├── package.json         # Root package.json
├── .vercelignore        # Files to ignore
├── backend/             # Backend code
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   ├── prisma/          # Database schema
│   └── routes/          # API routes
└── frontend/            # Frontend code (not deployed here)
```

## Testing

After deployment, test these endpoints:

- `https://your-backend.vercel.app/` - API info
- `https://your-backend.vercel.app/api/health` - Health check

## Troubleshooting

1. **404 Error**: Make sure `vercel.json` is in the root directory
2. **Build Error**: Check that all dependencies are in `backend/package.json`
3. **CORS Error**: Update allowed origins in `backend/server.js`
4. **Database Error**: Verify `DATABASE_URL` is correct

## Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
``` 