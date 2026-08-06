import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The date half of the footer's version stamp (src/version.ts), `YYYYMMDD`.
 *
 * The HEAD commit's COMMITTER date, not today's: on a merge the merge commit becomes HEAD, so
 * the build stamps the merge date without anyone typing it. `%cd` rather than `%ad` for the
 * same reason — an author date is the date the work was written, which a merge does not move.
 *
 * Falls back to today's UTC date when git is unavailable (a tarball build, a Docker layer with
 * no `.git`), so the stamp is always well-formed even if it is then only approximate.
 */
function buildDate(): string {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cd', '--date=format:%Y%m%d'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '')
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate()),
  },
  server: {
    // Vite's CLI does not read PORT, so honour it here — that is how a harness hands us a free
    // port when 5173 is already taken. Unset means Vite's own default.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})
