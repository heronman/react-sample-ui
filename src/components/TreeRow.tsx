import type { CSSProperties, ReactNode } from 'react'

interface TreeRowProps {
  variant: 'dir' | 'file'
  depth: number
  icon: string
  name: string
  selected: boolean
  onClick: () => void
  chevron?: ReactNode
  trailing?: ReactNode
  ariaExpanded?: boolean
}

function TreeRow({
  variant,
  depth,
  icon,
  name,
  selected,
  onClick,
  chevron,
  trailing,
  ariaExpanded,
}: TreeRowProps) {
  return (
    <button
      type="button"
      className={`tree-row tree-${variant}${selected ? ' selected' : ''}`}
      style={{ '--depth': depth } as CSSProperties}
      onClick={onClick}
      aria-expanded={ariaExpanded}
    >
      {chevron}
      <span className="icon" aria-hidden="true">
        {icon}
      </span>
      <span className="name">{name}</span>
      {trailing}
    </button>
  )
}

export default TreeRow
