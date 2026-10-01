import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";

const DIR = "content/blog";
const PILLARS = ["consult", "transform", "build", "operate", "secure", "solve", "grow"];
const files = readdirSync(DIR).filter((f) => f.endsWith(".md"));

test("every post has valid frontmatter, an existing cover and clean markdown", () => {
  assert.ok(files.length >= 40, `expected the migrated posts, found ${files.length}`);
  for (const f of files) {
    const { data, content } = matter(readFileSync(`${DIR}/${f}`, "utf8"));
    const slug = f.replace(/\.md$/, "");
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `slug ${slug}`);
    assert.ok(String(data.title ?? "").trim(), `${slug}: title`);
    assert.ok(String(data.description ?? "").trim().length >= 40, `${slug}: description`);
    assert.match(String(data.date), /^\d{4}-\d{2}-\d{2}$/, `${slug}: date`);
    assert.ok(PILLARS.includes(String(data.category)), `${slug}: category ${data.category}`);
    if (data.cover) assert.ok(existsSync(`public${data.cover}`), `${slug}: cover ${data.cover}`);
    for (const m of content.matchAll(/!\[[^\]]*]\((\/[^)\s]+)\)/g)) assert.ok(existsSync(`public${m[1]}`), `${slug}: image ${m[1]}`);
    assert.doesNotMatch(content, /\[fusion_|class="fusion|<div/i, `${slug}: leftover builder markup`);
    assert.doesNotMatch(content, /^# /m, `${slug}: body must not contain an h1`);
  }
});
