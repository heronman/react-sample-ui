import { formatSize } from '../utils/formatSize.ts'
import type { Selection } from './DetailsPanel.tsx'
import TreeRow from './TreeRow.tsx'

interface FileNodeProps {
  depth: number
  path: string
  name: string
  size?: number
  lastModified?: number
  isSymlink: boolean
  isBroken: boolean
  selected: boolean
  onSelect: (selection: Selection) => void
}

function FileNode({
  depth,
  path,
  name,
  size,
  lastModified,
  isSymlink,
  isBroken,
  selected,
  onSelect,
}: FileNodeProps) {
  return (
    <li className="tree-item">
      <TreeRow
        variant="file"
        depth={depth}
        icon="📄"
        name={name}
        selected={selected}
        onClick={() =>
          onSelect({ path, name, isDirectory: false, size, lastModified, isSymlink, isBroken })
        }
        trailing={formatSize(size) && <span className="size">{formatSize(size)}</span>}
      />
    </li>
  )
}

export default FileNode
