import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-6 md:px-10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between border-b border-white/[0.06]">
        <Link
          href="/"
          className="font-mono text-[13px] font-medium tracking-wide text-white/80 hover:text-white transition-colors"
        >
          Seneschal
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="font-mono text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="font-mono text-[13px] font-medium tracking-wide text-white transition-colors border border-white/15 rounded-full px-4 py-1.5 hover:bg-white/[0.04]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
