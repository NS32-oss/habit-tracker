const buildId = process.env.NEXT_PUBLIC_BUILD_ID || `build-${Date.now()}`
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || ''

console.log(`[next.config] buildId=${buildId} commit=${commitSha || 'n/a'}`)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
}

export default nextConfig
