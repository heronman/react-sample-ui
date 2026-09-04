import type { FsEntry } from '../types'

const BASE_URL = (import.meta.env.VITE_FS_API_URL ?? '').replace(/\/+$/, '')

interface RawEntry {
  name?: string
  path?: string
  type?: string
  isDirectory?: boolean
  isDir?: boolean
  size?: number
}

interface RawListResponse {
  entries?: RawEntry[]
  items?: RawEntry[]
  files?: RawEntry[]
}

// GET /api/fs/get[?path=...]
// Accepts a raw array of entries, or an object wrapping them under
// `entries`/`items`/`files`. Each entry is normalized to
// { name, path, isDirectory, size }.
export async function listDirectory(path = ''): Promise<FsEntry[]> {
  const params = new URLSearchParams()
  if (path) params.set('path', path)
  const query = params.toString()
  const url = `${BASE_URL}/api/fs/get${query ? `?${query}` : ''}`

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Не удалось прочитать «${path || '/'}» (${res.status})`)
  }

  const data: RawEntry[] | RawListResponse = await res.json()
  const rawEntries: RawEntry[] = Array.isArray(data)
    ? data
    : (data.entries ?? data.items ?? data.files ?? [])

  return rawEntries.map((raw) => normalizeEntry(raw, path)).sort(compareEntries)
}

function normalizeEntry(raw: RawEntry, parentPath: string): FsEntry {
  const name = raw.name ?? raw.path?.split('/').filter(Boolean).pop() ?? ''
  const path = raw.path ?? joinPath(parentPath, name)
  const type = String(raw.type ?? '').toLowerCase()
  const isDirectory = Boolean(
    raw.isDirectory ?? raw.isDir ?? (type === 'directory' || type === 'dir' || type === 'folder'),
  )
  return { name, path, isDirectory, size: raw.size }
}

function joinPath(parentPath: string, name: string): string {
  if (!parentPath) return name
  return `${parentPath.replace(/\/+$/, '')}/${name}`
}

function compareEntries(a: FsEntry, b: FsEntry): number {
  if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
  return a.name.localeCompare(b.name)
}
