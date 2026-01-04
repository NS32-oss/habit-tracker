import React from 'react'

const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 'dev-build'
const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'n/a'

export function BuildBadge() {
  return (
    <div className="fixed bottom-2 left-2 z-50 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
      <span>Build: {buildId}</span>
      {commitSha !== 'n/a' && <span className="ml-2 text-slate-300">Commit: {commitSha.slice(0, 7)}</span>}
    </div>
  )
}
