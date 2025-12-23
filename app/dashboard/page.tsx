"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallsRepo } from "@/lib/repos/CallsRepo";
import { formatDate } from "@/lib/utils";
import { Phone, TrendingUp, AlertCircle, Target } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

async function getStats() {
  const res = await fetch("/api/insights/overview");
  if (!res.ok) throw new Error("Failed to fetch stats");
  const data = await res.json();
  return data.data;
}

async function getRecentCalls() {
  const res = await fetch("/api/calls?limit=5");
  if (!res.ok) throw new Error("Failed to fetch calls");
  const data = await res.json();
  return data.data;
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ["recent-calls"],
    queryFn: getRecentCalls,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your sales team's performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Analyzed</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalCalls || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.avgScore || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Objection</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold capitalize">
                {stats?.topObjection || "None"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coaching Focus</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-sm font-medium text-muted-foreground">
                Review insights
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Latest calls analyzed by your team</CardDescription>
        </CardHeader>
        <CardContent>
          {callsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : calls && calls.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.slice(0, 5).map((call: any) => (
                  <TableRow key={call._id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/calls/${call._id}`}
                        className="font-medium hover:underline"
                      >
                        {call.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {typeof call.repId === "object" ? call.repId.name : "Unknown"}
                    </TableCell>
                    <TableCell>{formatDate(call.occurredAt)}</TableCell>
                    <TableCell>
                      {call.score ? (
                        <Badge variant={call.score.overall >= 70 ? "default" : "secondary"}>
                          {call.score.overall}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not scored</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {call.aiSummary ? (
                        <Badge variant="outline">Analyzed</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No calls yet. Start by adding your first call.</p>
              <Link href="/dashboard/calls" className="text-primary hover:underline mt-2 inline-block">
                Add Call →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

