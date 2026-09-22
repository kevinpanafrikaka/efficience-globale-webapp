import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

// Rend les bindings Cloudflare (D1, R2...) disponibles sous `next dev`,
// pas seulement en build/preview OpenNext.
initOpenNextCloudflareForDev();

export default nextConfig;
