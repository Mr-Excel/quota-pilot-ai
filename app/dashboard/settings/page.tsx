 "use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

      <PasswordSection />

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
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  isDemoMode ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isDemoMode ? "text-red-600" : "text-green-600"
                }`}
              >
                {isDemoMode ? "Demo Mode" : "Active"}
              </span>
            </div>
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

      <DangerZoneSection />
    </div>
  );
}

const PasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error?.message ?? "Failed to change password");
        setIsLoading(false);
        return;
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const DangerZoneSection = () => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeleting) return;

    if (confirmText.trim().toLowerCase() !== "delete") {
      toast.error('Please type "delete" to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error?.message ?? "Failed to delete account");
        setIsDeleting(false);
        return;
      }

      toast.success("Your account and all associated data have been deleted.");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle className="text-destructive text-red-500">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data (calls, reps, and insights). This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono">delete</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              className="border-red-500"
            />
          </div>
          <Button type="submit" className="bg-red-500 text-white hover:bg-red-600 border-red-500" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete account and all data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


