import type { CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listDirectory } from '../api/fsApi'
import type { FsEntry } from '../types'
import { isAncestorOrSelf } from '../utils/treePath.ts'
import { isHiddenName } from '../utils/isHiddenName.ts'
import FileNode from './FileNode.tsx'
import TreeRow from './TreeRow.tsx'
import type { Selection } from './DetailsPanel.tsx'

interface DirectoryNodeProps {
  path: string
  label: string
  depth: number
  expandedPath: string | null
  onToggleExpand: (path: string) => void
  selectedPath?: string
  onSelect: (selection: Selection) => void
  showHidden: boolean
}

function DirectoryNode({
  path,
  label,
  depth,
  expandedPath,
  onToggleExpand,
  selectedPath,
  onSelect,
  showHidden,
}: DirectoryNodeProps) {
  const expanded = expandedPath !== null && isAncestorOrSelf(path, expandedPath)

  const {
    data: allChildren,
    error,
    isFetching,
    refetch,
  } = useQuery<FsEntry[], Error>({
    queryKey: ['fs-entries', path],
    queryFn: () => listDirectory(path),
    enabled: expanded,
  })

  const children = showHidden ? allChildren : allChildren?.filter((c) => !isHiddenName(c.name))
  const loaded = children !== undefined

  return (
    <li className="tree-item">
      <TreeRow
        variant="dir"
        depth={depth}
        icon="📁"
        name={label}
        selected={selectedPath === path}
        ariaExpanded={expanded}
        chevron={
          <span className={`chevron${expanded ? ' open' : ''}`} aria-hidden="true">
            ▶
          </span>
        }
        trailing={isFetching && <span className="spinner" aria-hidden="true" />}
        onClick={() => {
          onToggleExpand(path)
          onSelect({ path, name: label, isDirectory: true })
        }}
      />

      {expanded && (
        <div className="tree-children">
          {error && (
            <div className="tree-error" style={{ '--depth': depth + 1 } as CSSProperties}>
              {error.message}
              <button type="button" className="link-button" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}

          {!error && loaded && children.length === 0 && (
            <div className="tree-empty" style={{ '--depth': depth + 1 } as CSSProperties}>
              Empty
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
                    expandedPath={expandedPath}
                    onToggleExpand={onToggleExpand}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                    showHidden={showHidden}
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
