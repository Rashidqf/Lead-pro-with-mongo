/**
 * Rolldown sometimes emits a circular SSR chunk pair where the entry imports
 * `__exportAll` from a sibling that also imports the entry — at runtime the
 * helper is still uninitialized (`TypeError: __exportAll is not a function`).
 *
 * Inline the helper into any chunk that imports it across that cycle.
 * Scans node-server (`.output/server/_ssr`) and Vercel (`.vercel/output`) builds.
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const EXPORT_ALL_HELPER = `var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};`;

const ROOTS = [
  path.join(process.cwd(), ".output", "server", "_ssr"),
  path.join(process.cwd(), ".vercel", "output"),
];

async function walkMjs(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walkMjs(full, out);
    else if (ent.isFile() && ent.name.endsWith(".mjs")) out.push(full);
  }
  return out;
}

async function fixFile(filePath) {
  let code = await readFile(filePath, "utf8");
  const importRe =
    /import\s*\{\s*(\w+)\s+as\s+__exportAll\s*\}\s*from\s*["'](\.\/[^"']+)["'];?/;
  const match = code.match(importRe);
  if (!match) return false;

  const [, , fromRel] = match;
  const fromPath = path.resolve(path.dirname(filePath), fromRel);

  let fromCode;
  try {
    fromCode = await readFile(fromPath, "utf8");
  } catch {
    return false;
  }

  const fileName = path.basename(filePath);
  const backImport = new RegExp(
    `from\\s*["']\\.\\/${fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
  );
  if (!backImport.test(fromCode)) return false;

  code = code.replace(importRe, EXPORT_ALL_HELPER);
  await writeFile(filePath, code);
  console.log(
    `[fix-ssr-exportall] Inlined __exportAll into ${path.relative(process.cwd(), filePath)}`,
  );
  return true;
}

async function main() {
  let fixed = 0;
  for (const root of ROOTS) {
    try {
      await stat(root);
    } catch {
      continue;
    }
    const files = await walkMjs(root);
    for (const file of files) {
      if (await fixFile(file)) fixed += 1;
    }
  }

  if (fixed === 0) {
    console.log("[fix-ssr-exportall] No circular __exportAll imports found");
  } else {
    console.log(`[fix-ssr-exportall] Fixed ${fixed} file(s)`);
  }
}

main().catch((err) => {
  console.error("[fix-ssr-exportall]", err);
  process.exit(1);
});
