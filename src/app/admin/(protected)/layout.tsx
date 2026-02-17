import { clearAdminSession, requireAdminAuth } from "@/lib/auth";
import { getPublicAdminPath } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminAuth();

  async function logoutAction() {
    "use server";
    await clearAdminSession();
    redirect(getPublicAdminPath("/login"));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href={getPublicAdminPath()} className="text-lg font-semibold">
              ComputerScienceX Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href={getPublicAdminPath()} className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href={getPublicAdminPath("/new-post")} className="hover:text-foreground">
                New Post
              </Link>
              <Link href="/blog" className="hover:text-foreground">
                Public Blog
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Log out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
