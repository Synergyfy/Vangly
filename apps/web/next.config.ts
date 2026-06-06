import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's dev file-system cache (on by default in v16.1+) holds a
    // serialized module graph keyed by file path. When a file's shape
    // changes drastically — for example, replacing the original
    // in-memory-mock `location/page.tsx` with a 3,500-line API-integrated
    // rewrite — the cache can return a chunk whose `reason` no longer
    // matches Turbopack's expected internal API, producing
    // `chunk.reason.enqueueModel is not a function`. Disabling the cache
    // is the recommended mitigation per the local-development guide.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
