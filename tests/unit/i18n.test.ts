// Locale parity: every locale bundle and dictionary mirrors English exactly in structure, ids, links and
// assets; only the human-readable text differs. Catches a missing translation or a drifted id/href.
import { test } from "node:test";
import assert from "node:assert/strict";
import { getContent } from "../../src/content/index.ts";
import { en } from "../../src/i18n/dictionaries/en.ts";
import { ar } from "../../src/i18n/dictionaries/ar.ts";

/** Keys whose values are identifiers, links or assets: identical in every locale. */
const STRUCTURAL = new Set([
  "id", "slug", "num", "href", "src", "logo", "group", "kind", "industry", "service", "span",
  "featured", "partnerId", "scale", "external", "toConfirm", "email", "emailHref", "phone", "phoneHref", "aspect",
]);

function compare(a: unknown, b: unknown, path: string, structural = STRUCTURAL) {
  if (typeof a === "function") {
    assert.equal(typeof b, "function", `${path} should be a function`);
    return;
  }
  if (Array.isArray(a)) {
    assert.ok(Array.isArray(b), `${path} should be an array`);
    assert.equal((b as unknown[]).length, a.length, `${path} length`);
    a.forEach((x, i) => compare(x, (b as unknown[])[i], `${path}[${i}]`, structural));
    return;
  }
  if (a && typeof a === "object") {
    assert.ok(b && typeof b === "object", `${path} should be an object`);
    assert.deepEqual(Object.keys(b as object).sort(), Object.keys(a).sort(), `${path} keys`);
    for (const k of Object.keys(a)) {
      const key = `${path}.${k}`;
      const av: unknown = (a as Record<string, unknown>)[k];
      const bv: unknown = (b as Record<string, unknown>)[k];
      if (structural.has(k)) assert.deepEqual(bv, av, `${key} must match English`);
      else compare(av, bv, key, structural);
    }
    return;
  }
  if (typeof a === "string") {
    assert.equal(typeof b, "string", `${path} should be a string`);
    if (a === "") assert.equal(b, "", `${path} should stay empty`);
    else assert.ok((b as string).trim().length > 0, `${path} is empty`);
    const stars = (s: string) => (s.match(/\*/g) ?? []).length;
    assert.equal(stars(b as string), stars(a), `${path}: keep exactly the English *accent* markers`);
    return;
  }
  assert.equal(typeof b, typeof a, `${path} type`);
}

test("Arabic content mirrors the English bundle", () => {
  const enC = getContent("en");
  const arC = getContent("ar");
  for (const key of Object.keys(enC) as (keyof typeof enC)[]) compare(enC[key], arC[key], key);
  // enum-like fields that share a name with display text elsewhere
  assert.deepEqual(arC.USE_CASES.map((u) => u.category), enC.USE_CASES.map((u) => u.category));
  assert.deepEqual(arC.PARTNERS.map((x) => x.exclusive), enC.PARTNERS.map((x) => x.exclusive));
});

test("Arabic content is actually translated", () => {
  const arC = getContent("ar");
  const arabic = /[؀-ۿ]/;
  for (const p of arC.SERVICES) for (const f of [p.name, p.tagline, p.headline, p.intro[0]]) assert.match(f, arabic, `${p.slug}: ${f}`);
  for (const c of arC.STORY) assert.match(c.title, arabic, c.id);
  for (const u of arC.USE_CASES) assert.match(u.title, arabic, u.id);
  for (const n of arC.NAV) assert.match(n.label, arabic, n.href);
});

test("Arabic dictionary has every English key", () => {
  compare(en, ar, "dict", new Set());
  assert.match(ar.home.pillarsTitle, /[؀-ۿ]/);
});

test("image alt text is localized, image files are shared", () => {
  const enC = getContent("en");
  const arC = getContent("ar");
  const a = enC.img("about-hero");
  const b = arC.img("about-hero");
  assert.equal(b.src, a.src);
  assert.notEqual(b.alt, a.alt);
});
