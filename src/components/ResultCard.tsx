type ResultCardProps = {
  result: string;
  model?: string;
};

export function ResultCard({ result, model }: ResultCardProps) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="text-sm text-gray-500">{model ? `模型：${model}` : "结果"}</div>
      <pre className="whitespace-pre-wrap text-sm leading-6">{result}</pre>
    </div>
  );
}

