import vm from "node:vm";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import { webcrypto } from "node:crypto";
import * as react from "react";
import * as jsx from "react/jsx-runtime";
const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");
const root = resolve(dirname(new URL(import.meta.url).pathname), "../..");

export async function adminRuntime({ authenticated = true } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(await readFile(resolve(root, "schema.sql"), "utf8"));
  const files = new Map();
  let reads = 0;
  const DB = {
    prepare(sql) {
      reads++;
      let args = [];
      const statement = {
        bind(...values) { args = values; return statement; },
        async first() { return sqlite.prepare(sql).get(...args) || null; },
        async all() { return { results: sqlite.prepare(sql).all(...args) }; },
        async run() { const result = sqlite.prepare(sql).run(...args); return { success: true, meta: { changes: Number(result.changes) } }; },
      };
      return statement;
    },
    async batch(statements) { return Promise.all(statements.map(s => s.run())); },
  };
  const env = { DB, ADMIN_PASSWORD: "test-password-only", UPLOADS: {
    async put(key, value) { files.set(key, value); },
    async delete(key) { files.delete(key); },
    async list() { return { objects: [...files.keys()].map(key => ({ key, size: 100, uploaded: new Date() })), truncated: false }; },
  } };
  const router = { push() {}, refresh() {} };
  const externals = {
    "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env }) },
    "@/lib/adminAuth": { isAdminRequest: async () => authenticated, isAdminAuthenticated: async () => authenticated },
    "react": react, "react/jsx-runtime": jsx,
    "next/link": { default: ({ href, children, ...props }) => react.createElement("a", { href, ...props }, children) },
    "next/image": { default: ({ fill, priority, ...props }) => react.createElement("img", props) },
    "next/navigation": { notFound() { throw new Error("NOT_FOUND"); }, useRouter: () => router, usePathname: () => "/admin" },
  };
  const context = vm.createContext({ Response, Request, Headers, FormData, File, URL, URLSearchParams, AbortSignal, TextEncoder, TextDecoder, Buffer, Date, Intl, crypto: webcrypto, console });
  const cache = new Map();
  const linking = new Map();
  async function load(specifier, parent = root + "/index.js") {
    if (externals[specifier]) {
      if (!cache.has(specifier)) {
        const values = externals[specifier];
        const module = new vm.SyntheticModule(Object.keys(values), function () { for (const [k, v] of Object.entries(values)) this.setExport(k, v); }, { context });
        cache.set(specifier, module);
      }
      return cache.get(specifier);
    }
    let path = specifier.startsWith("@/") ? resolve(root, "src", specifier.slice(2)) : resolve(dirname(parent), specifier);
    if (!extname(path)) path = [".js", ".jsx", ".mjs"].map(ext => path + ext).find(existsSync) || path + ".js";
    if (!cache.has(path)) {
      let module;
      if (path.endsWith(".css")) module = new vm.SyntheticModule([], function () {}, { context });
      else {
        const source = await readFile(path, "utf8");
        const { code } = transformSync(source, { filename: path, jsc: { target: "es2022", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "es6" } });
        module = new vm.SourceTextModule(code, { context, identifier: path });
      }
      cache.set(path, module);
      const linked = module.link(name => load(name, path));
      linking.set(path, linked);
      await linked;
    }
    await linking.get(path);
    return cache.get(path);
  }
  return {
    sqlite, env, files, get reads() { return reads; },
    async module(path) { const module = await load(resolve(root, path)); if (module.status !== "evaluated") await module.evaluate(); return module.namespace; },
    close() { sqlite.close(); },
  };
}
