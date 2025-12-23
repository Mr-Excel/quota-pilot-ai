import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../lib/db/models/User";
import { Rep } from "../lib/db/models/Rep";
import { Call } from "../lib/db/models/Call";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sampleTranscripts = [
  `Rep: Hi Sarah, thanks for taking the time today. I know you're busy, so I'll keep this focused.

Prospect: No problem, thanks for reaching out.

Rep: Great. So I understand you're currently using a manual process for tracking sales calls. Can you tell me a bit more about the challenges you're facing?

Prospect: Yeah, it's really time-consuming. We're spending hours each week just trying to figure out what happened in calls and who said what.

Rep: I see. And how many calls would you say your team handles per week?

Prospect: Probably around 50-60 calls across the team.

Rep: That's a lot. And with the manual process, are you able to identify patterns or coaching opportunities?

Prospect: Not really. We try, but it's just too much data to process manually.

Rep: That makes sense. What if I told you we could automate that analysis and give you insights in minutes instead of hours?

Prospect: That sounds interesting, but I'm concerned about the price. We have a tight budget this quarter.

Rep: I understand budget is always a consideration. Let me show you our pricing structure, and we can discuss what might work for your team.

Prospect: Okay, but I'll need to run this by my manager first.

Rep: Absolutely. How about we schedule a follow-up next week after you've had a chance to review with your team?

Prospect: That works. Let's do Tuesday afternoon.

Rep: Perfect. I'll send over a proposal and we can discuss on Tuesday.`,

  `Rep: Thanks for joining, Mike. I'm excited to show you what we've built.

Prospect: Yeah, I've heard good things. Let's see what you've got.

Rep: Great. So first, let me understand your current workflow. What tools are you using right now?

Prospect: We're using a combination of spreadsheets and a basic CRM. It's not ideal.

Rep: What's the biggest pain point with that setup?

Prospect: Honestly, it's the lack of visibility. I can't see how my team is performing without pulling reports manually.

Rep: And how often do you need those insights?

Prospect: Weekly at minimum, but ideally I'd want real-time visibility.

Rep: Perfect. Our platform gives you real-time dashboards with AI-powered insights. Let me show you...

Prospect: This looks good, but we're already evaluating a competitor's solution. What makes you different?

Rep: That's a great question. Our AI analysis is more advanced - we don't just transcribe, we actually score performance and detect objections automatically.

Prospect: Hmm, that's compelling. What's the implementation timeline?

Rep: We can have you up and running in about two weeks. Would that work for your timeline?

Prospect: Yeah, that could work. Let me think about it and get back to you.

Rep: Of course. I'll send you a detailed proposal and we can schedule a technical deep-dive if you're interested.`,

  `Rep: Hi Jennifer, thanks for making time today.

Prospect: Hi, no problem. I'm curious to learn more.

Rep: Great! So I understand you're looking to improve your sales coaching process. Can you tell me what that looks like today?

Prospect: Right now, I'm listening to calls manually and trying to give feedback, but it's not scalable. I have 15 reps and I can't possibly review all their calls.

Rep: That's a common challenge. How many calls would you estimate each rep makes per week?

Prospect: Probably 20-25 calls per rep, so we're talking hundreds of calls per week total.

Rep: And how long does it take you to review a single call?

Prospect: At least 30 minutes if I'm doing it properly. So I'm only getting to maybe 10-15 calls per week, which means most of my team isn't getting feedback.

Rep: I see. What if you could get AI-generated summaries and coaching notes for every call in seconds?

Prospect: That would be a game-changer. But I'm worried about accuracy. Can AI really understand the nuances of a sales conversation?

Rep: That's a valid concern. Our AI is trained specifically on sales conversations and has been validated by hundreds of sales managers. Would you like to see a sample analysis?

Prospect: Yes, that would be helpful.

Rep: Perfect. I'll send you a sample report after our call. Does next week work for a follow-up?

Prospect: Yes, let's do Thursday.`,

  `Rep: Hey Tom, thanks for the call. I know you're evaluating solutions.

Prospect: Yeah, we're looking at a few options. What makes your platform stand out?

Rep: Well, our core differentiator is the AI coaching engine. It doesn't just analyze calls - it provides actionable coaching notes for each rep.

Prospect: That's interesting. How does it work?

Rep: You upload call transcripts, and our AI analyzes them across four key dimensions: discovery, objection handling, clarity, and next steps. Then it generates a score and specific coaching recommendations.

Prospect: And the accuracy? I've seen AI tools that miss the mark.

Rep: Our model has been trained on over 10,000 sales calls and validated by industry experts. We're seeing 90%+ accuracy on objection detection.

Prospect: Okay, that's impressive. What about pricing?

Rep: We have a few different tiers. For a team your size, I'd recommend our Team plan at $149/month. That includes unlimited calls and all features.

Prospect: That's more than I was hoping to spend. Do you have any flexibility?

Rep: I understand. Let me see what I can do. Would you be open to an annual commitment? That could bring the price down.

Prospect: Maybe. I'll need to discuss with my team first.

Rep: Of course. When would be a good time to follow up?

Prospect: Let's say next Friday. I should have an answer by then.`,

  `Rep: Good morning, Lisa. Thanks for taking the call.

Prospect: Morning. I'm interested in learning more about your solution.

Rep: Excellent. So I understand you're managing a distributed sales team. What are the main challenges you're facing?

Prospect: Communication and consistency. It's hard to ensure everyone is following best practices when they're in different locations.

Rep: I can see how that would be challenging. Are you currently doing any call reviews?

Prospect: We try, but it's inconsistent. Some managers are better at it than others, and we don't have a standardized process.

Rep: That's exactly what we help solve. Our platform standardizes the review process and ensures every call gets analyzed the same way.

Prospect: That sounds good, but I'm concerned about adoption. Will my team actually use this?

Rep: Great question. We've found that reps love it because it gives them clear, actionable feedback. It's not just for managers - reps can see their own scores and coaching notes.

Prospect: That's a good point. How long does it take to get set up?

Rep: Very quick. You can be analyzing calls within 15 minutes of signing up. We'll help you import your first batch of calls.

Prospect: Okay, I'm interested. What's the next step?

Rep: I'll send you a demo account so you can try it with a few of your own calls. Then we can schedule a follow-up to discuss.

Prospect: Perfect. Let's do that.`,

  `Rep: Hi David, thanks for your time today.

Prospect: No problem. I saw your demo and I'm intrigued.

Rep: Great! What stood out to you in the demo?

Prospect: The objection detection feature. That's something we really struggle with - identifying when and how objections come up.

Rep: That's one of our strongest features. The AI can detect pricing objections, timing concerns, authority issues, and more - all automatically.

Prospect: And it's accurate?

Rep: Yes, we're seeing very high accuracy rates. But the real value is in the coaching notes - it doesn't just identify objections, it suggests how to handle them better next time.

Prospect: That's valuable. What about integration? We use Salesforce.

Rep: We have a Salesforce integration in beta. Would you be interested in being an early adopter?

Prospect: Possibly. What about security? Our calls contain sensitive customer information.

Rep: Absolutely. We're SOC 2 compliant and all data is encrypted. Your call data never leaves our secure infrastructure.

Prospect: Good to know. What's the pricing model?

Rep: We have a few options. For your team size, I'd recommend the Team plan. It's $149/month with unlimited calls.

Prospect: That seems reasonable. Let me think about it and get back to you.

Rep: Of course. I'll send you some additional resources and we can schedule a follow-up.`,

  `Rep: Thanks for joining, Amanda. I'm excited to show you what we can do.

Prospect: Me too. I've heard great things.

Rep: So let's start with understanding your current process. How are you handling call analysis today?

Prospect: We're not, really. That's the problem. We know we should be doing it, but we don't have the time or resources.

Rep: I understand. How many sales calls does your team make per week?

Prospect: Probably around 100 calls total across the team.

Rep: And how long would it take to manually review all of those?

Prospect: Way too long. That's why we're not doing it.

Rep: Exactly. With our platform, you can analyze all 100 calls in minutes, not hours. The AI does the heavy lifting.

Prospect: That sounds amazing. But I'm worried about the learning curve. My team isn't super tech-savvy.

Rep: That's a common concern, but our platform is designed to be simple. If you can upload a file, you can use CloserIQ. We also provide training and support.

Prospect: Okay, that's reassuring. What about cost?

Rep: For a team your size, our Team plan would be perfect. It's $149/month.

Prospect: That's within our budget. What's the implementation process?

Rep: Very straightforward. You sign up, add your reps, and start uploading calls. We'll help you get started.

Prospect: Great. I'd like to move forward. What do we need to do?

Rep: I'll send you a proposal and we can get you set up this week.`,

  `Rep: Hi Robert, thanks for making time.

Prospect: Sure thing. I'm looking for ways to improve our sales process.

Rep: Perfect. So tell me, what's your biggest challenge right now?

Prospect: Honestly, it's consistency. Some of my reps are great, others need more coaching, but I don't have a good way to identify who needs what.

Rep: That's a very common challenge. How are you currently identifying coaching opportunities?

Prospect: Mostly through gut feel and occasional call reviews. But it's not systematic.

Rep: I see. What if you had data-driven insights on every rep's performance, with specific coaching recommendations?

Prospect: That would be ideal. But is that realistic?

Rep: Absolutely. That's exactly what we provide. Every call gets scored, and we identify the top coaching area for each rep automatically.

Prospect: That sounds too good to be true. What's the catch?

Rep: No catch. The AI does the analysis, you provide the coaching. It's a tool to make you more effective, not replace you.

Prospect: Okay, I'm interested. What's the pricing?

Rep: We have a few tiers. For your team, I'd recommend the Team plan at $149/month.

Prospect: That seems fair. Can I try it first?

Rep: Absolutely. We offer a 14-day free trial with full access to all features.

Prospect: Perfect. Let's do that.`,
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGODB_URI environment variable is required");
      console.error("\nPlease create a .env file in the root directory with:");
      console.error("MONGODB_URI=mongodb://localhost:27017/closeriq");
      console.error("\nOr for MongoDB Atlas:");
      console.error("MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/closeriq");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Rep.deleteMany({});
    await Call.deleteMany({});
    console.log("Cleared existing data");

    // Create demo user
    const passwordHash = await bcrypt.hash("demo123", 10);
    const user = await User.create({
      email: "demo@closeriq.com",
      name: "Demo Manager",
      passwordHash,
      role: "manager",
    });
    console.log("Created demo user:", user.email);

    // Create reps
    const reps = await Rep.create([
      {
        userId: user._id,
        name: "Sarah Johnson",
        roleTitle: "Senior Account Executive",
        region: "West Coast",
      },
      {
        userId: user._id,
        name: "Michael Chen",
        roleTitle: "Account Executive",
        region: "East Coast",
      },
      {
        userId: user._id,
        name: "Emily Rodriguez",
        roleTitle: "Sales Development Rep",
        region: "Central",
      },
    ]);
    console.log(`Created ${reps.length} reps`);

    // Create calls with mock AI data
    const calls = [];
    const now = new Date();

    for (let i = 0; i < 8; i++) {
      const rep = reps[i % reps.length];
      const occurredAt = new Date(now);
      occurredAt.setDate(occurredAt.getDate() - (7 - i));

      // Generate mock score
      const baseScore = 65 + Math.floor(Math.random() * 30);
      const discovery = 6 + Math.floor(Math.random() * 4);
      const objectionsScore = 5 + Math.floor(Math.random() * 4);
      const clarity = 7 + Math.floor(Math.random() * 3);
      const nextSteps = 6 + Math.floor(Math.random() * 4);

      // Generate mock objections
      const objectionTypes = ["pricing", "timing", "authority", "need", "trust"];
      const objections = [];
      if (Math.random() > 0.3) {
        objections.push({
          type: objectionTypes[Math.floor(Math.random() * objectionTypes.length)],
          snippet: sampleTranscripts[i].substring(
            Math.floor(Math.random() * (sampleTranscripts[i].length - 100)),
            Math.floor(Math.random() * (sampleTranscripts[i].length - 100)) + 100
          ),
          confidence: 0.7 + Math.random() * 0.2,
        });
      }

      const call = await Call.create({
        userId: user._id,
        repId: rep._id,
        title: `Discovery Call ${i + 1} - ${["Acme Corp", "TechStart Inc", "Global Solutions", "Innovate Co", "Future Systems", "NextGen Ltd", "SmartBiz", "CloudTech"][i]}`,
        occurredAt,
        transcriptText: sampleTranscripts[i],
        source: "paste",
        aiSummary: `This call between ${rep.name} and the prospect covered key discovery questions about their current process and pain points. The rep demonstrated good listening skills and identified several areas where our solution could help.`,
        aiCoaching: "Strong discovery work. Consider asking more about the decision-making process earlier in the call. The pricing objection was handled well with a soft close.",
        score: {
          overall: baseScore,
          categories: {
            discovery,
            objections: objectionsScore,
            clarity,
            nextSteps,
          },
          rationale: "Good discovery questions and clear communication. Objection handling could be more proactive. Next steps were identified but could be more specific with timelines.",
        },
        objections,
      });

      calls.push(call);
    }

    console.log(`Created ${calls.length} calls with AI analysis`);
    console.log("\n✅ Seed completed successfully!");
    console.log("\nDemo credentials:");
    console.log("Email: demo@closeriq.com");
    console.log("Password: demo123");
    console.log("\nYou can now log in and explore the dashboard.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();

