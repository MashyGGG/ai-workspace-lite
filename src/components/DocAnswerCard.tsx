export function DocAnswerCard({
  answer,
  model,
}: {
  answer: string;
  model?: string;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="text-sm text-gray-500">
        {model ? `模型：${model}` : "回答"}
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-6">{answer}</pre>
    </div>
  );
}
