"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Target,
  BarChart3,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced AI analyzes every call transcript, identifying patterns and opportunities for improvement.",
  },
  {
    icon: TrendingUp,
    title: "Performance Scoring",
    description: "Get instant scores on discovery, objection handling, clarity, and next steps with detailed feedback.",
  },
  {
    icon: MessageSquare,
    title: "Objection Detection",
    description: "Automatically detect and tag objections like pricing, timing, and authority issues in real-time.",
  },
  {
    icon: Target,
    title: "Coaching Notes",
    description: "Receive actionable coaching notes tailored to each rep, helping them improve their sales skills.",
  },
  {
    icon: BarChart3,
    title: "Team Insights",
    description: "Track team performance trends, identify top performers, and spot coaching opportunities.",
  },
  {
    icon: Users,
    title: "Rep Management",
    description: "Organize calls by rep, track individual progress, and provide personalized feedback at scale.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to coach better
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to help sales managers and teams close more deals.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

