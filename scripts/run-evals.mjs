import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000";
const DATASET_PATH = path.join(ROOT, "evals", "datasets", "dataset_v1.jsonl");
const DEFAULT_REPORT_PATH = path.join(ROOT, "evals", "reports", "report_v1.md");

function resolveReportPath() {
  const envPath = process.env.EVAL_REPORT_PATH?.trim();
  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.join(ROOT, envPath);
  }
  const eq = process.argv.find((a) => a.startsWith("--out="));
  if (eq) {
    const p = eq.slice("--out=".length).trim();
    if (p) {
      return path.isAbsolute(p) ? p : path.join(ROOT, p);
    }
  }
  const outIdx = process.argv.indexOf("--out");
  if (outIdx !== -1) {
    const p = process.argv[outIdx + 1]?.trim();
    if (p && !p.startsWith("-")) {
      return path.isAbsolute(p) ? p : path.join(ROOT, p);
    }
  }
  return DEFAULT_REPORT_PATH;
}

function loadJsonl(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function includesAll(text, arr = []) {
  return arr.every((item) => text.includes(item));
}

function includesNone(text, arr = []) {
  return arr.every((item) => !text.includes(item));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callExtract(input) {
  const res = await fetch(`${BASE_URL}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function callDocs(input) {
  const res = await fetch(`${BASE_URL}/api/ask-docs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: input }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function callTask(input) {
  const res = await fetch(`${BASE_URL}/api/agent-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input, source: "docs" }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function gradeExtract(sample, output) {
  if (!output.ok) {
    return {
      pass: false,
      debug: `HTTP ${output.status}: ${JSON.stringify(output.data)}`,
    };
  }
  const text = JSON.stringify(output.data.result ?? {});
  return {
    pass:
      includesAll(text, sample.must_include || []) &&
      includesNone(text, sample.must_not_include || []),
    debug: text.slice(0, 2000) + (text.length > 2000 ? "…" : ""),
  };
}

function gradeDocs(sample, output) {
  if (!output.ok) {
    return {
      pass: false,
      debug: `HTTP ${output.status}: ${JSON.stringify(output.data)}`,
    };
  }
  const answer = output.data.answer || "";
  const hasCitation =
    Array.isArray(output.data.citations) && output.data.citations.length > 0;

  const basePass =
    includesAll(answer, sample.must_include || []) &&
    includesNone(answer, sample.must_not_include || []);
  const citePass = !sample.require_citation || hasCitation;

  return {
    pass: basePass && citePass,
    debug: `${answer.slice(0, 1500)}${answer.length > 1500 ? "…" : ""}\n[citations: ${output.data.citations?.length ?? 0}]`,
  };
}

function gradeTask(sample, output) {
  if (!output.ok) {
    return {
      pass: false,
      debug: `HTTP ${output.status}: ${JSON.stringify(output.data)}`,
    };
  }
  const proposed = !!output.data.proposedTask;
  const created = !!output.data.createdTask;
  const hasProposal = proposed || created;
  const expect = sample.expect_task !== false;
  return {
    pass: expect ? hasProposal : !hasProposal,
    debug: JSON.stringify(output.data.proposedTask ?? output.data.createdTask ?? null),
  };
}

async function main() {
  const reportPath = resolveReportPath();
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  let dataset;
  try {
    dataset = loadJsonl(DATASET_PATH);
  } catch (e) {
    console.error("Failed to read dataset:", DATASET_PATH, e);
    process.exit(1);
  }

  const results = [];

  for (const sample of dataset) {
    let output;
    let graded;

    if (sample.type === "extract") {
      output = await callExtract(sample.input);
      graded = gradeExtract(sample, output);
    } else if (sample.type === "docs") {
      output = await callDocs(sample.input);
      graded = gradeDocs(sample, output);
    } else if (sample.type === "task") {
      output = await callTask(sample.input);
      graded = gradeTask(sample, output);
    } else {
      graded = { pass: false, debug: "未知样本类型" };
    }

    results.push({
      id: sample.id,
      type: sample.type,
      pass: graded.pass,
      debug: graded.debug,
      notes: sample.notes || "",
    });

    await sleep(400);
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const byType = ["extract", "docs", "task"].map((t) => {
    const sub = results.filter((r) => r.type === t);
    const p = sub.filter((r) => r.pass).length;
    return { type: t, passed: p, total: sub.length };
  });

  let report = "# Eval Report v1\n\n";
  report += `- base_url: ${BASE_URL}\n`;
  report += `- total: ${total}\n`;
  report += `- passed: ${passed}\n`;
  report += `- pass_rate: ${total ? ((passed / total) * 100).toFixed(1) : "0"}%\n\n`;
  report += "## By type\n\n";
  for (const b of byType) {
    report += `- **${b.type}**: ${b.passed}/${b.total}\n`;
  }
  report += "\n## Cases\n\n";

  for (const r of results) {
    report += `### ${r.id} [${r.type}] - ${r.pass ? "PASS" : "FAIL"}\n`;
    report += `- notes: ${r.notes}\n`;
    report += "- debug:\n\n```text\n";
    report += r.debug;
    report += "\n```\n\n";
  }

  fs.writeFileSync(reportPath, report, "utf-8");
  console.log(`Done. ${passed}/${total} passed. Report: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});