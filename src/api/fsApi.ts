import type { FsEntry } from '../types'

const BASE_URL = (import.meta.env.VITE_FS_API_URL ?? '').replace(/\/+$/, '')

// Shape of components.schemas.FileEntry in docs/openapi.json.
// The live server actually serializes these two as `isDirectory`/
// `isSymlink`, not the `directory`/`symlink` the spec documents (likely
// a Jackson quirk with `is`-prefixed boolean fields) — accept both so
// we don't silently misclassify every entry as a file if that changes.
interface FileEntryDto {
  name: string
  path: string
  directory?: boolean
  isDirectory?: boolean
  symlink?: boolean
  isSymlink?: boolean
  broken: boolean
  size?: number
  lastModified?: number
  items?: FileEntryDto[] | null
}

// GET /api/fs/get[?path=...] — returns the entry for `path` (root by default),
// with its children (if any) under `items`. See docs/openapi.json.
export async function listDirectory(path = ''): Promise<FsEntry[]> {
  const entry = await fetchEntry(path)
  return (entry.items ?? []).map(normalizeEntry).sort(compareEntries)
}

async function fetchEntry(path: string): Promise<FileEntryDto> {
  const params = new URLSearchParams()
  if (path) params.set('path', path)
  const query = params.toString()
  const url = `${BASE_URL}/api/fs/get${query ? `?${query}` : ''}`

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Не удалось прочитать «${path || '/'}» (${res.status})`)
  }

  return res.json()
}

function normalizeEntry(raw: FileEntryDto): FsEntry {
  return {
    name: raw.name,
    path: raw.path,
    isDirectory: raw.directory ?? raw.isDirectory ?? false,
    isSymlink: raw.symlink ?? raw.isSymlink ?? false,
    isBroken: raw.broken,
    size: raw.size,
    lastModified: raw.lastModified,
  }
}

function compareEntries(a: FsEntry, b: FsEntry): number {
  if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
  return compareNames(a.name, b.name)
}

// Case-insensitive, but breaks ties between same-letter-different-case
// names by putting uppercase first (A < a < c, since 'A' < 'a' by code
// point once letter order is otherwise equal): "Apple" before "apple".
function compareNames(a: string, b: string): number {
  const caseInsensitive = a.localeCompare(b, undefined, { sensitivity: 'accent' })
  if (caseInsensitive !== 0) return caseInsensitive
  return a < b ? -1 : a > b ? 1 : 0
}
