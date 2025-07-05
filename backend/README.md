# Vocabulary App Backend

## Vercel Deployment

This backend is configured to deploy on Vercel as a serverless API.

### Environment Variables

Make sure to set these environment variables in your Vercel project:

1. **DATABASE_URL**: Your MongoDB Atlas connection string
2. **SESSION_SECRET**: A secure random string for session encryption
3. **FRONTEND_URL**: Your frontend domain (e.g., https://your-app.vercel.app)
4. **NODE_ENV**: Set to "production"

### Deployment Steps

1. **Connect to Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Login: `vercel login`
   - Deploy: `vercel --prod`

2. **Or use GitHub Integration**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically

### API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/vocab` - Get vocabulary list
- `POST /api/vocab/upload` - Upload vocabulary
- `GET /api/quiz/quiz1` - Get Quiz 1 questions
- `POST /api/quiz/quiz1/answer` - Submit Quiz 1 answer
- `GET /api/quiz/quiz2` - Get Quiz 2 cards
- `POST /api/quiz/quiz2/answer` - Submit Quiz 2 answer
- `GET /api/stats` - Get user statistics

### Troubleshooting

1. **404 Errors**: Make sure your `vercel.json` is in the root of your backend directory
2. **CORS Errors**: Update the `allowedOrigins` array in `server.js` with your frontend domain
3. **Database Connection**: Verify your `DATABASE_URL` is correct and accessible
4. **Session Issues**: Ensure `SESSION_SECRET` is set and secure

### Local Development

```bash
npm install
npm run dev
```

The server will run on `http://localhost:5000` 