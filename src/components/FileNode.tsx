import type { CSSProperties } from 'react'
import { formatSize } from '../utils/formatSize.ts'
import type { Selection } from './DetailsPanel.tsx'

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
      <button
        type="button"
        className={`tree-row tree-file${selected ? ' selected' : ''}`}
        style={{ '--depth': depth } as CSSProperties}
        onClick={() =>
          onSelect({ path, name, isDirectory: false, size, lastModified, isSymlink, isBroken })
        }
      >
        <span className="icon" aria-hidden="true">
          📄
        </span>
        <span className="name">{name}</span>
        {formatSize(size) && <span className="size">{formatSize(size)}</span>}
      </button>
    </li>
  )
}

export default FileNode
