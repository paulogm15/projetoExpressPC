import { ModeToggle } from "@/app/components/mode-toggle";
import { UserDropdown } from "@/app/components/user-dropdown";
import { getServerSession } from "@/lib/get-session";
import Link from "next/link";

<<<<<<< HEAD
export async function Navbar({ backHref, backLabel }: { backHref?: string; backLabel?: string } = {}) {
=======
export async function Navbar() {
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
  const session = await getServerSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <header className="bg-background border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-xl"
        >
          ExpressPc
        </Link>
        <div className="flex items-center gap-2">
<<<<<<< HEAD
          {backHref && (
            <Link
              href={backHref}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border rounded-md px-3 py-1.5"
            >
              ← {backLabel || "Voltar"}
            </Link>
          )}
=======
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
          <ModeToggle />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}