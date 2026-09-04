import { useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import DirectoryNode from './DirectoryNode'
import DetailsPanel, { type Selection } from './DetailsPanel.tsx'
import { isAncestorOrSelf, parentPath } from '../utils/treePath.ts'
import './FileTree.css'

const ROOT_PATH = ''

function FileTree() {
  const queryClient = useQueryClient()
  const isRefreshing = useIsFetching({ queryKey: ['fs-entries'] }) > 0
  const [selection, setSelection] = useState<Selection | null>(null)
  const [expandedPath, setExpandedPath] = useState<string | null>(ROOT_PATH)
  const [showHidden, setShowHidden] = useState(false)

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['fs-entries'] })
  }

  // Only one branch of the tree stays open at a time: opening a folder
  // collapses every node that isn't on its path.
  const toggleExpand = (path: string) => {
    setExpandedPath((current) => {
      const isOpen = current !== null && isAncestorOrSelf(path, current)
      if (!isOpen) return path
      return path === ROOT_PATH ? null : parentPath(path)
    })
  }

  return (
    <div className="file-tree">
      <header className="file-tree-header">
        <h1>File System</h1>
        <div className="file-tree-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            Show hidden files
          </label>
          <button type="button" onClick={refreshAll} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="file-tree-body">
        <div className="tree-scroll">
          <ul className="tree-list tree-root">
            <DirectoryNode
              path={ROOT_PATH}
              label="/"
              depth={0}
              expandedPath={expandedPath}
              onToggleExpand={toggleExpand}
              selectedPath={selection?.path}
              onSelect={setSelection}
              showHidden={showHidden}
            />
          </ul>
        </div>

        <DetailsPanel selection={selection} showHidden={showHidden} />
      </div>
    </div>
  )
}

export default FileTree
