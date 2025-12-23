# QuotaPilot Ai - AI Sales Manager

A complete SaaS MVP for AI-powered sales call analysis, coaching, and performance insights.

## 🎯 Product Overview

QuotaPilot Ai transforms sales calls into actionable insights. Upload call transcripts and get instant AI-powered analysis including:

- **Call Summaries**: Concise summaries with key moments and next steps
- **Performance Scoring**: Multi-dimensional scoring (Discovery, Objection Handling, Clarity, Next Steps)
- **Objection Detection**: Automatically identify and tag objections (pricing, timing, authority, etc.)
- **Coaching Notes**: Actionable feedback tailored to each rep
- **Team Analytics**: Track performance trends, rep rankings, and coaching opportunities

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth.js (Credentials provider, JWT sessions)
- **AI**: Groq LLM (with graceful demo mode fallback)
- **UI**: Tailwind CSS + shadcn/ui (Radix)
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Validation**: Zod
- **Forms**: React Hook Form

## 📁 Architecture

```
├── app/
│   ├── api/              # API route handlers (controllers)
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Auth pages
│   └── page.tsx          # Landing page
├── lib/
│   ├── ai/               # Groq integration + mock fallback
│   ├── db/               # MongoDB models
│   ├── repos/            # Repository layer (data access)
│   ├── services/         # Business logic layer
│   └── auth.ts           # NextAuth configuration
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── landing/          # Landing page components
│   └── dashboard/        # Dashboard components
└── scripts/
    └── seed.ts           # Database seeding script
```

### Design Patterns

- **Repository Pattern**: Clean data access layer (`/lib/repos`)
- **Service Layer**: Business logic separation (`/lib/services`)
- **API Controllers**: Thin route handlers that call services
- **Consistent API Responses**: `{ success, data?, error? }` shape
- **Error Handling**: Typed `AppError` with status codes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- (Optional) Groq API key for real AI features

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your app URL (e.g., `http://localhost:3000`)
- `GROQ_API_KEY`: (Optional) For real AI features

3. **Seed the database:**

```bash
npm run seed
```

This creates:
- Demo user: `demo@quotapilotai.com` / `demo123`
- 3 sample reps
- 8 calls with realistic transcripts and mock AI analysis

4. **Run the development server:**

```bash
npm run dev
```

5. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Features

### Landing Page
- Modern, conversion-focused design
- Hero section with CTAs
- Features grid
- Pricing tiers
- FAQ section
- Fully responsive

### Dashboard
- **Overview**: KPI cards, recent calls table
- **Calls**: Upload/paste transcripts, view all calls, filters
- **Call Details**: Full analysis with tabs for transcript, summary, score, objections
- **Reps**: Manage sales team members
- **Insights**: Charts (score trends, objection frequency), rep performance table
- **Settings**: Profile and AI configuration status

### AI Features

#### 1. Call Summary & Coaching
- Generates concise summaries
- Identifies key moments
- Lists next steps
- Provides actionable coaching notes

#### 2. Call Scoring
- Overall score (0-100)
- Category breakdowns:
  - Discovery (0-10)
  - Objection Handling (0-10)
  - Clarity (0-10)
  - Next Steps (0-10)
- Detailed rationale

#### 3. Objection Detection
- Automatically detects: pricing, timing, competitor, authority, need, trust
- Extracts relevant snippets
- Confidence scores

#### 4. Insights & Analytics
- Score trends over time
- Objection frequency charts
- Rep performance rankings
- Top coaching focus areas

## 🔐 Authentication

- **Provider**: NextAuth.js with Credentials
- **Session**: JWT strategy
- **Password Hashing**: bcryptjs
- **Protection**: Middleware for `/dashboard/*` routes
- **API Auth**: Server-side session checks in all API routes

## 🤖 AI Integration (Groq)

### Real Mode (with API key)
- Uses Groq's `llama-3.3-70b-versatile` model
- Structured JSON outputs
- Transcript truncation at 10,000 chars (with warning)

### Demo Mode (without API key)
- Deterministic mocked responses
- Same response shape as real API
- Clearly labeled in UI ("Demo Mode" badge)
- Perfect for development and demos

### Switching Modes
- Add `GROQ_API_KEY` to `.env` → Real AI
- Remove `GROQ_API_KEY` → Demo mode

## 📊 Database Models

### User
- `email`, `name`, `passwordHash`, `role`
- Indexed on `email`

### Rep
- `userId`, `name`, `roleTitle`, `region`
- Indexed on `userId`

### Call
- `userId`, `repId`, `title`, `occurredAt`, `transcriptText`, `source`
- `aiSummary`, `aiCoaching`
- `score` (nested object with categories)
- `objections` (array)
- Indexed on `userId`, `occurredAt`, `repId`

## 🔌 API Routes

All routes require authentication and return consistent `{ success, data?, error? }` format.

### Auth
- `GET/POST /api/auth/[...nextauth]` - NextAuth handler

### Reps
- `GET /api/reps` - List all reps for user
- `POST /api/reps` - Create new rep

### Calls
- `GET /api/calls?repId=&from=&to=&minScore=&maxScore=` - List calls with filters
- `POST /api/calls` - Create new call
- `GET /api/calls/[id]` - Get call details
- `PATCH /api/calls/[id]` - Update call
- `DELETE /api/calls/[id]` - Delete call

### AI
- `POST /api/ai/summarize` - Generate call summary
- `POST /api/ai/score` - Score a call
- `POST /api/ai/objections` - Detect objections

### Insights
- `GET /api/insights/overview` - Get aggregated insights

## 🎨 Design System

- **Colors**: CSS variables with light/dark mode support
- **Typography**: Inter font (via Next.js)
- **Spacing**: Consistent Tailwind scale
- **Components**: shadcn/ui (Radix primitives)
- **Animations**: Framer Motion (respects reduced motion)
- **Accessibility**: ARIA labels, keyboard navigation, focus states

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### MongoDB Atlas Setup

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `MONGODB_URI` in Vercel environment variables
4. Whitelist Vercel IPs (or use 0.0.0.0/0 for development)

### Environment Variables (Production)

Set in Vercel dashboard:
- `MONGODB_URI`
- `NEXTAUTH_SECRET` (generate new one)
- `NEXTAUTH_URL` (your production URL)
- `GROQ_API_KEY` (optional)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with demo data
- `npm run lint` - Run ESLint

## 🎥 Loom Script Outline (5-10 min)

### 1. Introduction (1 min)
- What is QuotaPilot Ai?
- Problem it solves
- Target audience

### 2. Landing Page Walkthrough (1 min)
- Modern design
- Key sections
- CTA flow

### 3. Dashboard Overview (2 min)
- Login with demo credentials
- Dashboard KPIs
- Navigation structure

### 4. Core Features Demo (4 min)
- **Feature 1**: Add a call (upload/paste transcript)
- **Feature 2**: Generate AI summary and coaching notes
- **Feature 3**: Score the call (show breakdown)
- **Feature 4**: Detect objections
- **Insights**: Show charts and rep performance

### 5. Architecture & Tech (1 min)
- Clean separation (repos, services, API)
- Groq integration + demo mode
- Database models

### 6. Tradeoffs & Next Steps (1 min)
- What's real vs mocked
- What would be next (integrations, more AI models, etc.)

## 🧪 What's Real vs Mocked

### Real
- ✅ Full authentication flow
- ✅ Database operations (MongoDB)
- ✅ API routes and validation
- ✅ UI/UX (all components functional)
- ✅ Data fetching and caching (TanStack Query)
- ✅ Groq AI (when API key provided)

### Mocked
- ❌ External call recording integrations (Zoom, Gong, etc.)
- ❌ Groq AI responses (when no API key - uses deterministic mocks)
- ❌ Email notifications
- ❌ Payment processing

## 🔒 Security

- Password hashing with bcrypt
- JWT session tokens
- Server-side session validation
- User-scoped data access (no cross-user access)
- Input validation with Zod
- SQL injection protection (MongoDB)
- XSS protection (React)

## 📄 License

MIT

## 🤝 Contributing

This is an MVP codebase. Feel free to fork and extend!

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
