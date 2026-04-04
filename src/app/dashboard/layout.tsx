import Link from "next/link";
import { clearSession } from "@/lib/auth/session";

const navItems = [
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/exceptions", label: "Exceptions" },
  { href: "/dashboard/suppliers", label: "Suppliers" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function logout() {
    "use server";
    await clearSession();
    const { redirect } = await import("next/navigation");
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6 gap-8">
          <Link href="/dashboard" className="font-bold text-lg">
            Seneschal
          </Link>
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout} className="ml-auto">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
