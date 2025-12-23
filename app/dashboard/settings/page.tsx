"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

async function getAiStatus() {
  const res = await fetch("/api/ai/status");
  if (!res.ok) throw new Error("Failed to fetch AI status");
  const data = await res.json();
  return data.data;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: getAiStatus,
  });
  const isDemoMode = !aiStatus?.available;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={session?.user?.name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={session?.user?.email || ""} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>AI service status and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Service Status</p>
              <p className="text-sm text-muted-foreground">
                {isDemoMode
                  ? "Running in demo mode with mocked responses"
                  : "Connected to Groq AI service"}
              </p>
            </div>
            <Badge variant={isDemoMode ? "secondary" : "default"}>
              {isDemoMode ? "Demo Mode" : "Active"}
            </Badge>
          </div>
          {isDemoMode && (
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                To enable real AI analysis, add your <code className="text-xs">GROQ_API_KEY</code> to
                your environment variables. See the README for setup instructions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

