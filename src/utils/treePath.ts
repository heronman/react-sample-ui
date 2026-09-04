// `ancestor` is an ancestor of (or the same node as) `path`.
export function isAncestorOrSelf(ancestor: string, path: string): boolean {
  return ancestor === '' || ancestor === path || path.startsWith(`${ancestor}/`)
}

export function parentPath(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx === -1 ? '' : path.slice(0, idx)
}
