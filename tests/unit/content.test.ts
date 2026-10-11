import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  SERVICES, USE_CASES, SOLUTIONS, PARTNERS, CLIENT_SECTORS, KEY_PROJECTS, REFERENCE_GROUPS,
  VALUES, INDUSTRIES, METRICS, COMPANY, STORY, IMAGES, getService,
} from "../../src/content/index.ts";

const imageSrcs = new Set(Object.values(IMAGES).map((i) => i.src));

test("four ordered service pillars", () => {
  assert.deepEqual(SERVICES.map((p) => p.slug), ["consultancy", "managed-services", "software-development", "digital-marketing"]);
  SERVICES.forEach((p, i) => {
    assert.equal(p.num, String(i + 1).padStart(2, "0"));
    assert.ok(p.groups.flatMap((g) => g.services).length >= 4, `${p.slug} services`);
    assert.equal(getService(p.slug), p);
  });
});

test("story chapters: one per service pillar, spans tile the 9 scene beats", () => {
  assert.deepEqual(STORY.slice(1, -1).map((c) => c.id).sort(), SERVICES.map((p) => p.slug).sort());
  STORY.forEach((c, i) => assert.equal(c.span[0], i === 0 ? 0 : STORY[i - 1].span[1], c.id));
  assert.equal(STORY.at(-1)!.span[1], 9);
  for (const c of STORY) if (c.beats) assert.equal(c.beats.length, c.span[1] - c.span[0], c.id);
});

test("use cases reference valid pillars, industries and images", () => {
  assert.equal(USE_CASES.length, 12);
  const industries = new Set(INDUSTRIES.map((i) => i.id));
  for (const u of USE_CASES) {
    assert.ok(getService(u.service), u.id);
    assert.ok(industries.has(u.industry), u.id);
    assert.ok(imageSrcs.has(u.image.src), u.id);
    assert.ok(u.results.length >= 1, u.id);
  }
});

test("partners resolve and logo files exist", () => {
  const logos = [
    ...PARTNERS, ...CLIENT_SECTORS.flatMap((s) => s.clients), ...KEY_PROJECTS, ...REFERENCE_GROUPS.flatMap((g) => g.logos),
  ].filter((l) => l.logo);
  for (const l of logos) assert.ok(existsSync(`public${l.logo}`), `missing ${l.logo}`);
});

test("company, values, solutions, industries, metrics", () => {
  assert.equal(VALUES.length, 7);
  assert.equal(SOLUTIONS.length, 6);
  assert.equal(SOLUTIONS.filter((s) => s.kind === "own").length, 4);
  assert.equal(INDUSTRIES.length, 7);
  assert.equal(METRICS.length, 5);
  assert.equal(COMPANY.email, "info@growdigital.com");
});
