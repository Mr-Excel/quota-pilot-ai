"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { Brain, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

async function getCall(id: string) {
  const res = await fetch(`/api/calls/${id}`);
  if (!res.ok) throw new Error("Failed to fetch call");
  const data = await res.json();
  return data.data;
}

async function generateSummary(callId: string) {
  const res = await fetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to generate summary");
  }
  return res.json();
}

async function generateScore(callId: string) {
  const res = await fetch("/api/ai/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to score call");
  }
  return res.json();
}

async function detectObjections(callId: string) {
  const res = await fetch("/api/ai/objections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to detect objections");
  }
  return res.json();
}

async function getAiStatus() {
  const res = await fetch("/api/ai/status");
  if (!res.ok) throw new Error("Failed to fetch AI status");
  const data = await res.json();
  return data.data;
}

export default function CallDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const callId = params.id as string;

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: getAiStatus,
  });

  const { data: call, isLoading } = useQuery({
    queryKey: ["call", callId],
    queryFn: () => getCall(callId),
  });

  const summaryMutation = useMutation({
    mutationFn: () => generateSummary(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call", callId] });
      toast.success("Summary generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const scoreMutation = useMutation({
    mutationFn: () => generateScore(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call", callId] });
      toast.success("Call scored successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const objectionsMutation = useMutation({
    mutationFn: () => detectObjections(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call", callId] });
      toast.success("Objections detected successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Call not found</p>
        <Button onClick={() => router.push("/dashboard/calls")} className="mt-4">
          Back to Calls
        </Button>
      </div>
    );
  }

  const isDemoMode = !aiStatus?.available;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{call.title}</h1>
          <p className="text-muted-foreground">
            {typeof call.repId === "object" ? call.repId.name : "Unknown Rep"} •{" "}
            {formatDateTime(call.occurredAt)}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/calls")}>
          Back
        </Button>
      </div>

      {isDemoMode && (
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Demo Mode:</strong> AI features are using mocked responses. Add GROQ_API_KEY to
            your environment to enable real AI analysis.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {call.score ? (
              <div className="text-3xl font-bold">{call.score.overall}</div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Not scored yet</p>
                <Button
                  size="sm"
                  onClick={() => scoreMutation.mutate()}
                  disabled={scoreMutation.isPending}
                >
                  {scoreMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Score Call
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {call.aiSummary ? (
              <p className="text-sm line-clamp-3">{call.aiSummary}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No summary yet</p>
                <Button
                  size="sm"
                  onClick={() => summaryMutation.mutate()}
                  disabled={summaryMutation.isPending}
                >
                  {summaryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objections</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {call.objections && call.objections.length > 0 ? (
              <div className="text-3xl font-bold">{call.objections.length}</div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No objections detected</p>
                <Button
                  size="sm"
                  onClick={() => objectionsMutation.mutate()}
                  disabled={objectionsMutation.isPending}
                >
                  {objectionsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Detect Objections
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transcript" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="summary">Summary & Coaching</TabsTrigger>
          <TabsTrigger value="score">Score Breakdown</TabsTrigger>
          <TabsTrigger value="objections">Objections</TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                {call.transcriptText}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {call.aiSummary ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{call.aiSummary}</p>
                </CardContent>
              </Card>
              {call.aiCoaching && (
                <Card>
                  <CardHeader>
                    <CardTitle>Coaching Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{call.aiCoaching}</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No summary generated yet</p>
                <Button
                  onClick={() => summaryMutation.mutate()}
                  disabled={summaryMutation.isPending}
                >
                  {summaryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="score" className="space-y-4">
          {call.score ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Discovery</span>
                      <span className="text-sm font-medium">{call.score.categories.discovery}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(call.score.categories.discovery / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Objection Handling</span>
                      <span className="text-sm font-medium">{call.score.categories.objections}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(call.score.categories.objections / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Clarity</span>
                      <span className="text-sm font-medium">{call.score.categories.clarity}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(call.score.categories.clarity / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Next Steps</span>
                      <span className="text-sm font-medium">{call.score.categories.nextSteps}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(call.score.categories.nextSteps / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rationale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{call.score.rationale}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Call not scored yet</p>
                <Button
                  onClick={() => scoreMutation.mutate()}
                  disabled={scoreMutation.isPending}
                >
                  {scoreMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Score Call
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="objections" className="space-y-4">
          {call.objections && call.objections.length > 0 ? (
            <div className="space-y-4">
              {call.objections.map((obj: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{obj.type}</CardTitle>
                      <Badge variant="secondary">
                        {Math.round(obj.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">"{obj.snippet}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No objections detected yet</p>
                <Button
                  onClick={() => objectionsMutation.mutate()}
                  disabled={objectionsMutation.isPending}
                >
                  {objectionsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Detect Objections
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

