import fs from "fs";
import path from "path";

const IMPORTANT_DIR = path.join(process.cwd(), "docs", "important");

function resolvedImportantDir(): string {
  return path.resolve(IMPORTANT_DIR);
}

export type ImportantDocListItem = {
  slug: string;
  filename: string;
};

function markdownBasenamesInDir(dir: string): Set<string> {
  if (!fs.existsSync(dir)) {
    return new Set();
  }
  const names = fs.readdirSync(dir);
  const slugs = new Set<string>();
  for (const name of names) {
    if (!name.endsWith(".md") || name.startsWith(".")) continue;
    slugs.add(name.slice(0, -".md".length));
  }
  return slugs;
}

export function listImportantDocs(): ImportantDocListItem[] {
  const dir = resolvedImportantDir();
  if (!fs.existsSync(dir)) {
    return [];
  }
  const names = fs.readdirSync(dir);
  return names
    .filter((name) => name.endsWith(".md") && !name.startsWith("."))
    .map((filename) => ({
      slug: filename.slice(0, -".md".length),
      filename,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getImportantDoc(
  slug: string,
): { slug: string; filename: string; content: string } | null {
  if (!slug?.trim()) {
    return null;
  }

  const dir = resolvedImportantDir();
  const allowed = markdownBasenamesInDir(dir);
  if (!allowed.has(slug)) {
    return null;
  }

  const filename = `${slug}.md`;
  const filePath = path.join(dir, filename);
  const resolvedFile = path.resolve(filePath);
  const prefix = resolvedImportantDir() + path.sep;
  if (!resolvedFile.startsWith(prefix)) {
    return null;
  }

  const content = fs.readFileSync(resolvedFile, "utf-8");
  return { slug, filename, content };
}
