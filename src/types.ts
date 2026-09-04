export interface FsEntry {
  name: string
  path: string
  isDirectory: boolean
  isSymlink: boolean
  isBroken: boolean
  size?: number
  lastModified?: number
}
