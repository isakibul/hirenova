import Link from "next/link";

export default function Nav() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        Hire<span className="text-blue-500">Nova</span>
      </Link>

      <nav className="hidden gap-6 text-sm text-gray-300 md:flex">
        <a href="#features" className="hover:text-white">
          Features
        </a>
        <a href="#how" className="hover:text-white">
          How it Works
        </a>
        <a href="#jobs" className="hover:text-white">
          Jobs
        </a>
      </nav>

      <button className="rounded-lg bg-blue-600 px-4 py-2 transition hover:bg-blue-700">
        Get Started
      </button>
    </header>
  );
}
