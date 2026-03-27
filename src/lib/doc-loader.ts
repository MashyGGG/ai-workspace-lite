import fs from "fs";
import path from "path";

export type DocEntry = {
  filename: string;
  content: string;
  charCount: number;
};

type DocIndex = {
  documents: DocEntry[];
  totalFiles: number;
  totalChars: number;
  createdAt: string;
};

const INDEX_PATH = path.join(process.cwd(), "doc-index.json");

export function loadDocuments(): DocEntry[] {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(
      "doc-index.json 不存在，请先运行 node scripts/setup-doc-index.mjs",
    );
  }

  const raw = fs.readFileSync(INDEX_PATH, "utf-8");
  const index: DocIndex = JSON.parse(raw);

  if (!index.documents?.length) {
    throw new Error("doc-index.json 中没有文档");
  }

  return index.documents;
}

export function buildDocContext(docs: DocEntry[]): string {
  return docs
    .map(
      (doc) =>
        `=== 文件：${doc.filename} ===\n${doc.content}\n=== 文件结束：${doc.filename} ===`,
    )
    .join("\n\n");
}
