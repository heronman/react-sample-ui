import { useQuery } from '@tanstack/react-query'
import { listDirectory } from '../api/fsApi'
import type { FsEntry } from '../types'
import { formatSize } from '../utils/formatSize.ts'
import { isHiddenName } from '../utils/isHiddenName.ts'

export interface Selection {
  path: string
  name: string
  isDirectory: boolean
  size?: number
  lastModified?: number
  isSymlink?: boolean
  isBroken?: boolean
}

interface DetailsPanelProps {
  selection: Selection | null
  showHidden: boolean
}

function DetailsPanel({ selection, showHidden }: DetailsPanelProps) {
  if (!selection) {
    return (
      <div className="details-panel">
        <p className="details-placeholder">Select a folder or file in the tree on the left</p>
      </div>
    )
  }

  return selection.isDirectory ? (
    <DirectoryListing path={selection.path} label={selection.name} showHidden={showHidden} />
  ) : (
    <FileMetadata selection={selection} />
  )
}

function DirectoryListing({
  path,
  label,
  showHidden,
}: {
  path: string
  label: string
  showHidden: boolean
}) {
  const {
    data: allEntries,
    error,
    isLoading,
  } = useQuery<FsEntry[], Error>({
    queryKey: ['fs-entries', path],
    queryFn: () => listDirectory(path),
  })

  const entries = showHidden ? allEntries : allEntries?.filter((e) => !isHiddenName(e.name))

  return (
    <div className="details-panel">
      <h2 className="details-title">{label}</h2>

      {isLoading && <p className="details-status">Loading…</p>}
      {error && <p className="details-status details-error">{error.message}</p>}
      {entries && entries.length === 0 && <p className="details-status">Folder is empty</p>}

      {entries && entries.length > 0 && (
        <ul className="details-list">
          {entries.map((entry) => (
            <li key={entry.path} className="details-list-item">
              <span className="icon" aria-hidden="true">
                {entry.isDirectory ? '📁' : '📄'}
              </span>
              <span className="name">{entry.name}</span>
              {formatSize(entry.size) && <span className="size">{formatSize(entry.size)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FileMetadata({ selection }: { selection: Selection }) {
  const dotIndex = selection.name.lastIndexOf('.')
  const extension = dotIndex > 0 ? selection.name.slice(dotIndex + 1) : undefined

  return (
    <div className="details-panel">
      <h2 className="details-title">{selection.name}</h2>
      <dl className="details-meta">
        <dt>Path</dt>
        <dd>{selection.path}</dd>
        <dt>Type</dt>
        <dd>File</dd>
        {extension && (
          <>
            <dt>Extension</dt>
            <dd>.{extension}</dd>
          </>
        )}
        <dt>Size</dt>
        <dd>{formatSize(selection.size) ?? '—'}</dd>
        <dt>Modified</dt>
        <dd>{formatDate(selection.lastModified) ?? '—'}</dd>
        {selection.isSymlink && (
          <>
            <dt>Symlink</dt>
            <dd>Yes</dd>
          </>
        )}
        {selection.isBroken && (
          <>
            <dt>Status</dt>
            <dd className="details-error">Broken link</dd>
          </>
        )}
      </dl>
    </div>
  )
}

function formatDate(timestamp: number | undefined): string | null {
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return null
  return new Date(timestamp).toLocaleString()
}

export default DetailsPanel
