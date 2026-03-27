import fs from "fs";
import path from "path";

const docsDir = path.join(process.cwd(), "sample-docs");
const outputPath = path.join(process.cwd(), "doc-index.json");

function main() {
  const names = fs.readdirSync(docsDir).filter((name) => {
    const ext = path.extname(name).toLowerCase();
    return [".md", ".txt", ".pdf", ".docx"].includes(ext);
  });

  if (!names.length) {
    throw new Error("sample-docs/ 目录下没有可索引的文件");
  }

  const documents = names.map((name) => {
    const filePath = path.join(docsDir, name);
    const content = fs.readFileSync(filePath, "utf-8");
    return {
      filename: name,
      content,
      charCount: content.length,
    };
  });

  const index = {
    documents,
    totalFiles: documents.length,
    totalChars: documents.reduce((sum, d) => sum + d.charCount, 0),
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), "utf-8");

  console.log(`已生成 doc-index.json`);
  console.log(`  文件数: ${index.totalFiles}`);
  console.log(`  总字符: ${index.totalChars}`);
  for (const doc of documents) {
    console.log(`  - ${doc.filename} (${doc.charCount} chars)`);
  }
}

main();
