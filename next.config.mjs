/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin tracing root so Next.js ignores stray lockfiles elsewhere.
  outputFileTracingRoot: import.meta.dirname,
  // Remove the floating route-info toolbar in dev.
  devIndicators: false,
};

export default nextConfig;
