"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const callSchema = z.object({
  title: z.string().min(1, "Title is required"),
  repId: z.string().min(1, "Rep is required"),
  occurredAt: z.string().min(1, "Date is required"),
  transcriptText: z.string().min(1, "Transcript is required"),
  source: z.enum(["paste", "upload"]),
});

type CallFormData = z.infer<typeof callSchema>;

async function getCalls() {
  const res = await fetch("/api/calls");
  if (!res.ok) throw new Error("Failed to fetch calls");
  const data = await res.json();
  return data.data;
}

async function getReps() {
  const res = await fetch("/api/reps");
  if (!res.ok) throw new Error("Failed to fetch reps");
  const data = await res.json();
  return data.data;
}

async function createCall(data: CallFormData) {
  const res = await fetch("/api/calls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      occurredAt: new Date(data.occurredAt).toISOString(),
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to create call");
  }
  return res.json();
}

export default function CallsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: calls, isLoading } = useQuery({
    queryKey: ["calls"],
    queryFn: getCalls,
  });

  // Read shared search term from Header (stored in React Query cache)
  const callsSearchTerm = useQueryClient().getQueryData<string>(["calls-search-term"]) || "";

  const filteredCalls = useMemo(() => {
    if (!callsSearchTerm.trim() || !calls) return calls || [];
    const term = callsSearchTerm.toLowerCase();
    return calls.filter((call: any) => {
      const titleMatch = call.title?.toLowerCase().includes(term);
      const repName =
        typeof call.repId === "object" && call.repId?.name ? call.repId.name.toLowerCase() : "";
      const repMatch = repName.includes(term);
      const tagMatch =
        Array.isArray(call.tags) &&
        call.tags.some((t: string) => t.toLowerCase().includes(term));
      return titleMatch || repMatch || tagMatch;
    });
  }, [calls, callsSearchTerm]);

  const { data: reps } = useQuery({
    queryKey: ["reps"],
    queryFn: getReps,
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: {
      source: "paste",
    },
  });

  const source = watch("source");

  const createMutation = useMutation({
    mutationFn: createCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast.success("Call created successfully");
      reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setValue("transcriptText", text);
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = (data: CallFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
          <p className="text-muted-foreground">Manage and analyze your sales calls</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Call
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Add New Call</DialogTitle>
              <DialogDescription>
                Upload a transcript or paste it directly
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Call Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Discovery call with Acme Corp"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repId">Sales Rep</Label>
                <Select onValueChange={(value) => setValue("repId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {reps?.map((rep: any) => (
                      <SelectItem key={rep._id} value={rep._id}>
                        {rep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.repId && (
                  <p className="text-sm text-destructive">{errors.repId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occurredAt">Call Date</Label>
                <Input
                  id="occurredAt"
                  type="datetime-local"
                  {...register("occurredAt")}
                />
                {errors.occurredAt && (
                  <p className="text-sm text-destructive">{errors.occurredAt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={source === "paste" ? "default" : "outline"}
                    onClick={() => setValue("source", "paste")}
                  >
                    Paste
                  </Button>
                  <Button
                    type="button"
                    variant={source === "upload" ? "default" : "outline"}
                    onClick={() => setValue("source", "upload")}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <input type="hidden" {...register("source")} />
              </div>

              {source === "upload" ? (
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Transcript (.txt)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="transcriptText">Transcript</Label>
                <Textarea
                  id="transcriptText"
                  {...register("transcriptText")}
                  placeholder="Paste call transcript here..."
                  rows={10}
                />
                {errors.transcriptText && (
                  <p className="text-sm text-destructive">{errors.transcriptText.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Call"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Calls</CardTitle>
          <CardDescription>View and manage all your sales calls</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredCalls && filteredCalls.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                {filteredCalls.map((call: any) => (
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
                    <TableCell>
                      <Link href={`/dashboard/calls/${call._id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No calls yet. Create your first call to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

