# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/closeriq
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your-groq-key-optional
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 3. Seed Database

```bash
npm run seed
```

This creates:
- Demo user: `demo@closeriq.com` / `demo123`
- 3 sample reps
- 8 calls with AI analysis

## 4. Run Development Server

```bash
npm run dev
```

## 5. Access the App

- Landing: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard (after login)

## Demo Credentials

- **Email**: demo@closeriq.com
- **Password**: demo123

## MongoDB Atlas Setup (Optional)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier works)
3. Get connection string
4. Replace `MONGODB_URI` in `.env`
5. Whitelist your IP (or use 0.0.0.0/0 for development)

## Groq API Key (Optional)

1. Sign up at https://console.groq.com
2. Get your API key
3. Add to `.env` as `GROQ_API_KEY`
4. Without it, the app runs in "Demo Mode" with mocked AI responses

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally, or
- Check your Atlas connection string
- Verify network access/whitelist

### NextAuth Errors
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL

### Build Errors
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (18+ required)

