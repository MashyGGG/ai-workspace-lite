import Link from "next/link";

const cards = [
  {
    href: "/prompt",
    title: "Prompt Lab",
    description: "选择任务类型，对比不同 prompt 下的模型输出。",
  },
  {
    href: "/extract",
    title: "Structured Extractor",
    description: "从长文本抽取摘要、行动项、风险与待确认问题。",
  },
  {
    href: "/docs",
    title: "Doc QA with Citations",
    description: "基于已索引文档进行带引用与检索预览的问答。",
  },
  {
    href: "/workspace",
    title: "Approval-based Tasks",
    description: "Agent 提议创建任务，经你确认后才写入列表。",
  },
  {
    href: "/ops",
    title: "Ops & Cost",
    description: "查看近期请求的 token、延迟与估算成本。",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">AI Workspace Lite Beta</h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          作品集版工作台：结构化抽取、带引用文档问答、审批式任务、本地评测与安全回归，以及 Ops
          观测。导航栏可进入各页面；完成分析后可在{" "}
          <Link href="/workspace" className="underline hover:text-black">
            Workspace
          </Link>{" "}
          创建跟进任务，在{" "}
          <Link href="/ops" className="underline hover:text-black">
            Ops
          </Link>{" "}
          查看调用摘要。
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-400 hover:shadow"
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{c.description}</p>
              <span className="mt-4 inline-block text-sm text-gray-900 underline">
                进入
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
