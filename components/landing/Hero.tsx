"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const Hero = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Meet{" "}
              <span className="lowercase bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                QuotaPilot Ai
              </span>
              <span className="block">your AI sales manager in the loop</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            QuotaPilot Ai analyzes your sales calls with AI, providing instant scoring, objection detection,
            and actionable coaching notes so your team hits quota with fewer guesswork reviews.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link href="/signup">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link
              href="https://www.loom.com/share/259d6e0af2314429b3a4f2059a05d1c7"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" asChild>
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </>
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-5xl rounded-lg border bg-card p-2 shadow-2xl">
              <div className="aspect-video w-full rounded-md bg-muted flex items-center justify-center">
                {!imageError ? (
                  <Image 
                    src="/Dashboard.PNG" 
                    alt="Dashboard Preview" 
                    width={1200} 
                    height={800}
                    className="rounded-md object-contain"
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground text-lg">Dashboard Preview</p>
                    <p className="text-sm text-muted-foreground mt-2">Visual representation of QuotaPilot Ai dashboard</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

