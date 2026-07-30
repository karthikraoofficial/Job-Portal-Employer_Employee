import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Server Actions accept a 1 MB body by default, which is smaller than the
      // 5 MB resume limit the upload form advertises. Without this, any resume
      // over 1 MB fails with a raw 500 before our own size check ever runs.
      //
      // Set comfortably above the 5 MB resume limit so that an oversized file
      // still reaches our own validator and gets a readable "the limit is 5 MB"
      // message, rather than being killed by the framework first.
      // MAX_RESUME_BYTES in src/lib/resume-file.ts remains the real limit.
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;
