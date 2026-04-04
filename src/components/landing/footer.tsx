import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-6 md:px-10 border-t border-white/[0.06]">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between">
        <p className="font-mono text-[11px] text-white/20">
          &copy; {new Date().getFullYear()} Seneschal
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="font-mono text-[11px] text-white/20 hover:text-white/50 transition-colors"
          >
            Operator login
          </Link>
          <Link
            href="#early-access"
            className="font-mono text-[11px] text-white/20 hover:text-white/50 transition-colors"
          >
            Request access
          </Link>
        </div>
      </div>
    </footer>
  );
}
