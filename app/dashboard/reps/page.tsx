"use client";

import { useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const repSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  region: z.string().optional(),
});

type RepFormData = z.infer<typeof repSchema>;

async function getReps() {
  const res = await fetch("/api/reps");
  if (!res.ok) throw new Error("Failed to fetch reps");
  const data = await res.json();
  return data.data;
}

async function createRep(data: RepFormData) {
  const res = await fetch("/api/reps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to create rep");
  }
  return res.json();
}

export default function RepsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: reps, isLoading } = useQuery({
    queryKey: ["reps"],
    queryFn: getReps,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RepFormData>({
    resolver: zodResolver(repSchema),
  });

  const createMutation = useMutation({
    mutationFn: createRep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reps"] });
      toast.success("Rep created successfully");
      reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: RepFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reps</h1>
          <p className="text-muted-foreground">Manage your sales team</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Rep
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add New Rep</DialogTitle>
              <DialogDescription>Add a new sales rep to your team</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="John Doe" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleTitle">Role Title</Label>
                <Input
                  id="roleTitle"
                  {...register("roleTitle")}
                  placeholder="e.g., Senior Account Executive"
                />
                {errors.roleTitle && (
                  <p className="text-sm text-destructive">{errors.roleTitle.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region (Optional)</Label>
                <Input id="region" {...register("region")} placeholder="e.g., West Coast" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Rep"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reps</CardTitle>
          <CardDescription>View and manage your sales team members</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reps && reps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Region</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reps.map((rep: any) => (
                  <TableRow key={rep._id}>
                    <TableCell className="font-medium">{rep.name}</TableCell>
                    <TableCell>{rep.roleTitle}</TableCell>
                    <TableCell>{rep.region || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reps yet. Add your first rep to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

