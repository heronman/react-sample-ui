import type { FsEntry } from '../types'

const BASE_URL = (import.meta.env.VITE_FS_API_URL ?? '').replace(/\/+$/, '')

// Shape of components.schemas.FileEntry in docs/openapi.json
interface FileEntryDto {
  name: string
  path: string
  directory: boolean
  symlink: boolean
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
    isDirectory: raw.directory,
    isSymlink: raw.symlink,
    isBroken: raw.broken,
    size: raw.size,
    lastModified: raw.lastModified,
  }
}

function compareEntries(a: FsEntry, b: FsEntry): number {
  if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
  return a.name.localeCompare(b.name)
}
