// Download history tracking using localStorage (v1 - client-side only)

const HISTORY_KEY = 'stockus_download_history'

export interface DownloadRecord {
  templateId: number
  templateTitle: string
  filename: string
  downloadedAt: string // ISO date string
}

function getHistory(): DownloadRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHistory(history: DownloadRecord[]): void {
  if (typeof window === 'undefined') return
  // Keep only last 50 downloads
  const trimmed = history.slice(-50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
}

export function recordDownload(templateId: number, templateTitle: string, filename: string): void {
  const history = getHistory()

  history.push({
    templateId,
    templateTitle,
    filename,
    downloadedAt: new Date().toISOString()
  })

  saveHistory(history)
}

export function getDownloadHistory(): DownloadRecord[] {
  return getHistory().reverse() // Most recent first
}

export function getRecentDownloads(limit: number = 5): DownloadRecord[] {
  return getDownloadHistory().slice(0, limit)
}

export function hasDownloaded(templateId: number): boolean {
  return getHistory().some(r => r.templateId === templateId)
}
