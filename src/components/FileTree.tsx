import { useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import DirectoryNode from './DirectoryNode'
import DetailsPanel, { type Selection } from './DetailsPanel.tsx'
import './FileTree.css'

const ROOT_PATH = ''

function FileTree() {
  const queryClient = useQueryClient()
  const isRefreshing = useIsFetching({ queryKey: ['fs-entries'] }) > 0
  const [selection, setSelection] = useState<Selection | null>(null)

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['fs-entries'] })
  }

  return (
    <div className="file-tree">
      <header className="file-tree-header">
        <h1>Файловая система</h1>
        <button type="button" onClick={refreshAll} disabled={isRefreshing}>
          {isRefreshing ? 'Обновление…' : 'Refresh'}
        </button>
      </header>

      <div className="file-tree-body">
        <div className="tree-scroll">
          <ul className="tree-list tree-root">
            <DirectoryNode
              path={ROOT_PATH}
              label="/"
              depth={0}
              defaultExpanded
              selectedPath={selection?.path}
              onSelect={setSelection}
            />
          </ul>
        </div>

        <DetailsPanel selection={selection} />
      </div>
    </div>
  )
}

export default FileTree
