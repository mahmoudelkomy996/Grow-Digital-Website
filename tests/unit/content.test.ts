import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  PILLARS, USE_CASES, SOLUTIONS, PARTNERS, CLIENT_SECTORS, KEY_PROJECTS, REFERENCE_GROUPS,
  VALUES, INDUSTRIES, METRICS, COMPANY, STORY, IMAGES, getPillar,
} from "../../src/content/index.ts";

const imageSrcs = new Set(Object.values(IMAGES).map((i) => i.src));

test("seven ordered pillars with services and deep dives", () => {
  assert.deepEqual(PILLARS.map((p) => p.slug), ["consult", "transform", "build", "operate", "secure", "solve", "grow"]);
  PILLARS.forEach((p, i) => {
    assert.equal(p.num, String(i + 1).padStart(2, "0"));
    assert.ok(p.services.flatMap((g) => g.items).length >= 5, `${p.slug} services`);
    assert.ok(p.deepDives.length >= 2, `${p.slug} deep dives`);
    assert.ok(p.featured.length >= 3 && p.featured.length <= 5);
    assert.ok(imageSrcs.has(p.hero.src) && imageSrcs.has(p.secondary.src));
    assert.equal(getPillar(p.slug), p);
  });
});

test("story titles match pillar headlines", () => {
  for (const p of PILLARS) assert.equal(STORY.find((c) => c.id === p.slug)?.title, p.headline);
});

test("use cases reference valid pillars, industries and images", () => {
  assert.equal(USE_CASES.length, 12);
  const industries = new Set(INDUSTRIES.map((i) => i.id));
  for (const u of USE_CASES) {
    assert.ok(getPillar(u.pillar), u.id);
    assert.ok(industries.has(u.industry), u.id);
    assert.ok(imageSrcs.has(u.image.src), u.id);
    assert.ok(u.results.length >= 1, u.id);
  }
  const ids = new Set(USE_CASES.map((u) => u.id));
  for (const p of PILLARS) for (const id of p.useCaseIds) assert.ok(ids.has(id), `${p.slug} → ${id}`);
});

test("partners resolve and logo files exist", () => {
  const partnerIds = new Set(PARTNERS.map((p) => p.id));
  for (const p of PILLARS) for (const id of p.partnerIds) assert.ok(partnerIds.has(id), `${p.slug} → ${id}`);
  const logos = [
    ...PARTNERS, ...CLIENT_SECTORS.flatMap((s) => s.clients), ...KEY_PROJECTS, ...REFERENCE_GROUPS.flatMap((g) => g.logos),
  ].filter((l) => l.logo);
  for (const l of logos) assert.ok(existsSync(`public${l.logo}`), `missing ${l.logo}`);
});

test("company, values, solutions, industries, metrics", () => {
  assert.equal(VALUES.length, 7);
  assert.equal(SOLUTIONS.length, 5);
  assert.equal(SOLUTIONS.filter((s) => s.kind === "own").length, 3);
  assert.equal(INDUSTRIES.length, 7);
  assert.equal(METRICS.length, 5);
  assert.equal(COMPANY.email, "info@growdigital.com");
});
