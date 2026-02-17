import { getPublicAdminPath } from "@/lib/admin-path";
import { createAdminSession, isAdminAuthenticated, validateAdminCredentials } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const alreadyAuthed = await isAdminAuthenticated();

  if (alreadyAuthed) {
    redirect(getPublicAdminPath());
  }

  async function loginAction(formData: FormData) {
    "use server";

    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!validateAdminCredentials(username, password)) {
      redirect(getPublicAdminPath("/login?error=invalid"));
    }

    await createAdminSession(username);
    redirect(getPublicAdminPath());
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Hidden control panel for ComputerScienceX.com</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {params.error === "invalid" ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                Invalid username or password.
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Enter Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
