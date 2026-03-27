import Link from "next/link";

export function AppNav() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-6 py-3 text-sm">
        <Link href="/" className="text-gray-700 hover:text-black hover:underline">
          Prompt Lab v1
        </Link>
        <Link href="/extract" className="text-gray-700 hover:text-black hover:underline">
          Structured Extractor v1
        </Link>
        <Link href="/docs" className="text-gray-700 hover:text-black hover:underline">
          Doc QA v1
        </Link>
      </div>
    </nav>
  );
}
