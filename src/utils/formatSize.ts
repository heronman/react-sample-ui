const UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

export function formatSize(bytes: number | undefined): string | null {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return null

  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const formatted = unitIndex === 0 ? String(value) : value.toFixed(1)
  return `${formatted} ${UNITS[unitIndex]}`
}
