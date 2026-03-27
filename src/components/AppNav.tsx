import Link from "next/link";

export function AppNav() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-4 gap-y-2 px-6 py-3 text-sm">
        <span className="mr-2 font-semibold text-gray-900">
          AI Workspace Lite Beta
        </span>
        <Link href="/" className="text-gray-700 hover:text-black hover:underline">
          Home
        </Link>
        <Link href="/prompt" className="text-gray-700 hover:text-black hover:underline">
          Prompt Lab
        </Link>
        <Link href="/extract" className="text-gray-700 hover:text-black hover:underline">
          Extract
        </Link>
        <Link href="/docs" className="text-gray-700 hover:text-black hover:underline">
          Docs
        </Link>
        <Link href="/workspace" className="text-gray-700 hover:text-black hover:underline">
          Workspace
        </Link>
        <Link href="/ops" className="text-gray-700 hover:text-black hover:underline">
          Ops
        </Link>
      </div>
    </nav>
  );
}
