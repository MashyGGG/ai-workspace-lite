import type { ExtractionResult } from "@/schemas/extraction";

type Props = {
  data: ExtractionResult;
  model?: string;
};

const severityClass: Record<ExtractionResult["risks"][number]["severity"], string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-900 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const severityLabel: Record<ExtractionResult["risks"][number]["severity"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export function ExtractionResultCard({ data, model }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-4">
        <div className="mb-2 text-sm text-gray-500">
          {model ? `模型：${model}` : "抽取结果"}
        </div>
        <h2 className="mb-2 text-lg font-semibold">简要总结</h2>
        <p className="text-sm leading-6">{data.summary}</p>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">行动项</h2>
        {data.actionItems.length ? (
          <ul className="space-y-3">
            {data.actionItems.map((item, idx) => (
              <li key={idx} className="rounded-lg bg-gray-50 p-3 text-sm">
                <div>
                  <strong>任务：</strong>
                  {item.task}
                </div>
                <div>
                  <strong>负责人：</strong>
                  {item.owner || "未明确"}
                </div>
                <div>
                  <strong>截止时间：</strong>
                  {item.dueDate || "未明确"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">未发现明确行动项</p>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">风险</h2>
        {data.risks.length ? (
          <ul className="space-y-3">
            {data.risks.map((risk, idx) => (
              <li key={idx} className="rounded-lg bg-gray-50 p-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <strong>风险点：</strong>
                  <span>{risk.title}</span>
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${severityClass[risk.severity]}`}
                  >
                    {severityLabel[risk.severity]} ({risk.severity})
                  </span>
                </div>
                <div>
                  <strong>原因：</strong>
                  {risk.reason}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">未发现明显风险</p>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">待确认问题</h2>
        {data.openQuestions.length ? (
          <ul className="list-disc pl-5 text-sm leading-7">
            {data.openQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">暂无待确认问题</p>
        )}
      </div>
    </div>
  );
}
