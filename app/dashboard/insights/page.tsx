"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

async function getInsights() {
  const res = await fetch("/api/insights/overview");
  if (!res.ok) throw new Error("Failed to fetch insights");
  const data = await res.json();
  return data.data;
}

export default function InsightsPage() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: getInsights,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Performance analytics and team insights
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : insights ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
                <CardDescription>Average call score over time</CardDescription>
              </CardHeader>
              <CardContent>
                {insights.scoreTrend && insights.scoreTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={insights.scoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objection Frequency</CardTitle>
                <CardDescription>Most common objections detected</CardDescription>
              </CardHeader>
              <CardContent>
                {insights.objectionFrequency && insights.objectionFrequency.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={insights.objectionFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No objections detected yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rep Performance</CardTitle>
              <CardDescription>Team members ranked by average score</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.repPerformance && insights.repPerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rep</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Calls</TableHead>
                      <TableHead>Top Coaching Area</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insights.repPerformance.map((rep: any) => (
                      <TableRow key={rep.repId}>
                        <TableCell className="font-medium">{rep.repName}</TableCell>
                        <TableCell>
                          <Badge variant={rep.avgScore >= 70 ? "default" : "secondary"}>
                            {rep.avgScore}
                          </Badge>
                        </TableCell>
                        <TableCell>{rep.callCount}</TableCell>
                        <TableCell className="capitalize">{rep.topCoachingArea}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No performance data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

