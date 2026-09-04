import { useQuery } from '@tanstack/react-query'
import { listDirectory } from '../api/fsApi'
import type { FsEntry } from '../types'
import { formatSize } from '../utils/formatSize.ts'

export interface Selection {
  path: string
  name: string
  isDirectory: boolean
  size?: number
}

interface DetailsPanelProps {
  selection: Selection | null
}

function DetailsPanel({ selection }: DetailsPanelProps) {
  if (!selection) {
    return (
      <div className="details-panel">
        <p className="details-placeholder">Выберите каталог или файл в дереве слева</p>
      </div>
    )
  }

  return selection.isDirectory ? (
    <DirectoryListing path={selection.path} label={selection.name} />
  ) : (
    <FileMetadata selection={selection} />
  )
}

function DirectoryListing({ path, label }: { path: string; label: string }) {
  const {
    data: entries,
    error,
    isLoading,
  } = useQuery<FsEntry[], Error>({
    queryKey: ['fs-entries', path],
    queryFn: () => listDirectory(path),
  })

  return (
    <div className="details-panel">
      <h2 className="details-title">{label}</h2>

      {isLoading && <p className="details-status">Загрузка…</p>}
      {error && <p className="details-status details-error">{error.message}</p>}
      {entries && entries.length === 0 && <p className="details-status">Каталог пуст</p>}

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
        <dt>Путь</dt>
        <dd>{selection.path}</dd>
        <dt>Тип</dt>
        <dd>Файл</dd>
        {extension && (
          <>
            <dt>Расширение</dt>
            <dd>.{extension}</dd>
          </>
        )}
        <dt>Размер</dt>
        <dd>{formatSize(selection.size) ?? '—'}</dd>
      </dl>
    </div>
  )
}

export default DetailsPanel
