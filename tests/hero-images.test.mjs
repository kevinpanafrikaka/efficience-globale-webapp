import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { HERO_IMAGES } from "../src/lib/hero-images.mjs";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

test("Every public hero has a distinct, valid portrait asset and preserves its landscape", async () => {
  const root = new URL("../public/", import.meta.url);
  assert.equal(Object.keys(HERO_IMAGES).length, 9);
  for (const [desktop, { mobile, width, height }] of Object.entries(HERO_IMAGES)) {
    const portrait = await sharp(await readFile(new URL(mobile.slice(1), root))).metadata();
    const landscape = await sharp(await readFile(new URL(desktop.slice(1), root))).metadata();
    assert.notEqual(mobile, desktop);
    assert.deepEqual([portrait.width, portrait.height, portrait.format], [768, 1152, "webp"]);
    assert.deepEqual([landscape.width, landscape.height], [width, height]);
    assert.ok(width > height);
  }
});

test("Hero markup offers a mobile source and a single landscape fallback without preloading both", async () => {
  const runtime = await adminRuntime();
  try {
    const { default: HeroImage } = await runtime.module("src/components/HeroImage.jsx");
    for (const [desktop, { mobile }] of Object.entries(HERO_IMAGES)) {
      const html = renderToStaticMarkup(createElement(HeroImage, { src: desktop }));
      assert.match(html, /<picture/);
      assert.match(html, /media="\(max-width: 767px\)"/);
      assert.ok(html.includes(`srcSet="${mobile}"`));
      assert.ok(html.includes(`src="${desktop}"`));
      assert.equal((html.match(/<img /g) || []).length, 1);
      assert.doesNotMatch(html, /rel="preload"/);
      assert.match(html, /fetchPriority="high"/);
    }
  } finally { runtime.close(); }
});
