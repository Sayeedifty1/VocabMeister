# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### 1. 404 NOT_FOUND Error

**Problem**: Getting 404 errors when accessing your API endpoints.

**Solutions**:
- Make sure `vercel.json` is in the root of your backend directory
- Verify the `api/index.js` file exists and exports the app correctly
- Check that your routes are properly configured in `server.js`

### 2. CORS Errors

**Problem**: Frontend can't connect to backend due to CORS issues.

**Solutions**:
- Update the `allowedOrigins` array in `server.js` with your frontend domain
- Add your frontend URL to the environment variables
- Make sure `credentials: true` is set in CORS configuration

### 3. Database Connection Issues

**Problem**: Can't connect to MongoDB Atlas.

**Solutions**:
- Verify your `DATABASE_URL` is correct in Vercel environment variables
- Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
- Check that your database user has the correct permissions

### 4. Session Issues

**Problem**: Sessions not persisting or authentication failing.

**Solutions**:
- Set a strong `SESSION_SECRET` in environment variables
- Make sure `secure: true` is set for cookies in production
- Verify MongoDB connection for session storage

### 5. Prisma Issues

**Problem**: Prisma client not generated or database schema issues.

**Solutions**:
- Run `npx prisma generate` before deployment
- Make sure `postinstall` script is in `package.json`
- Verify your Prisma schema is correct

### 6. Environment Variables

**Required Variables**:
```bash
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database
SESSION_SECRET=your-super-secure-random-string
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### 7. Testing Your Deployment

1. **Health Check**: Visit `https://your-backend.vercel.app/api/health`
2. **Test Endpoint**: Visit `https://your-backend.vercel.app/api/test`
3. **API Info**: Visit `https://your-backend.vercel.app/`

### 8. Debugging Steps

1. Check Vercel deployment logs in the dashboard
2. Test endpoints with curl or Postman
3. Verify environment variables are set correctly
4. Check MongoDB Atlas logs for connection issues

### 9. Common Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel remove
```

### 10. Still Having Issues?

1. Check the Vercel documentation: https://vercel.com/docs
2. Review your deployment logs in the Vercel dashboard
3. Test your API locally first: `npm run dev`
4. Make sure all dependencies are in `package.json` 