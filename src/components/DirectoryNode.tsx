import { useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listDirectory } from '../api/fsApi'
import type { FsEntry } from '../types'
import FileNode from './FileNode.tsx'
import type { Selection } from './DetailsPanel.tsx'

interface DirectoryNodeProps {
  path: string
  label: string
  depth: number
  defaultExpanded?: boolean
  selectedPath?: string
  onSelect: (selection: Selection) => void
}

function DirectoryNode({
  path,
  label,
  depth,
  defaultExpanded,
  selectedPath,
  onSelect,
}: DirectoryNodeProps) {
  const [expanded, setExpanded] = useState(Boolean(defaultExpanded))

  const {
    data: children,
    error,
    isFetching,
    refetch,
  } = useQuery<FsEntry[], Error>({
    queryKey: ['fs-entries', path],
    queryFn: () => listDirectory(path),
    enabled: expanded,
  })

  const loaded = children !== undefined

  return (
    <li className="tree-item">
      <button
        type="button"
        className={`tree-row tree-dir${selectedPath === path ? ' selected' : ''}`}
        style={{ '--depth': depth } as CSSProperties}
        onClick={() => {
          setExpanded((prev) => !prev)
          onSelect({ path, name: label, isDirectory: true })
        }}
        aria-expanded={expanded}
      >
        <span className={`chevron${expanded ? ' open' : ''}`} aria-hidden="true">
          ▶
        </span>
        <span className="icon" aria-hidden="true">
          📁
        </span>
        <span className="name">{label}</span>
        {isFetching && <span className="spinner" aria-hidden="true" />}
      </button>

      {expanded && (
        <div className="tree-children">
          {error && (
            <div className="tree-error" style={{ '--depth': depth + 1 } as CSSProperties}>
              {error.message}
              <button type="button" className="link-button" onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          )}

          {!error && loaded && children.length === 0 && (
            <div className="tree-empty" style={{ '--depth': depth + 1 } as CSSProperties}>
              Пусто
            </div>
          )}

          {!error && loaded && children.length > 0 && (
            <ul className="tree-list">
              {children.map((child) =>
                child.isDirectory ? (
                  <DirectoryNode
                    key={child.path}
                    path={child.path}
                    label={child.name}
                    depth={depth + 1}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                  />
                ) : (
                  <FileNode
                    key={child.path}
                    depth={depth + 1}
                    path={child.path}
                    name={child.name}
                    size={child.size}
                    lastModified={child.lastModified}
                    isSymlink={child.isSymlink}
                    isBroken={child.isBroken}
                    selected={selectedPath === child.path}
                    onSelect={onSelect}
                  />
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default DirectoryNode
