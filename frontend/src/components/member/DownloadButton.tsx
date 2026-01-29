'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { recordDownload } from '@/lib/download-history'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Extract filename from URL or Content-Disposition header
 * Falls back to provided fallbackFilename
 */
function extractFilename(url: string, fallbackFilename: string): string {
  // Try to get filename from URL path
  try {
    const urlPath = new URL(url, 'http://localhost').pathname
    const pathFilename = urlPath.split('/').pop()
    if (pathFilename && pathFilename.includes('.')) {
      return decodeURIComponent(pathFilename)
    }
  } catch {
    // URL parsing failed, continue to fallback
  }

  // Use fallback, ensure it has an extension
  if (!fallbackFilename.includes('.')) {
    return `${fallbackFilename}.xlsx` // Default extension for templates
  }
  return fallbackFilename
}

interface DownloadButtonProps {
  templateId: number
  templateTitle: string // Added for history tracking
  fileUrl: string // URL to derive filename from
  disabled?: boolean
}

export function DownloadButton({ templateId, templateTitle, fileUrl, disabled }: DownloadButtonProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Derive filename from fileUrl with proper fallback
  const filename = extractFilename(fileUrl, templateTitle)

  const handleDownload = async () => {
    setStatus('downloading')
    setProgress(0)
    setError(null)

    try {
      const response = await axios.get(
        `${API_URL}/templates/${templateId}/download`,
        {
          responseType: 'blob',
          withCredentials: true,
          onDownloadProgress: (progressEvent) => {
            const total = progressEvent.total || progressEvent.loaded
            const percent = Math.round((progressEvent.loaded * 100) / total)
            setProgress(percent)
          },
        }
      )

      // Try to get filename from Content-Disposition header
      let downloadFilename = filename
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', downloadFilename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Record in download history
      recordDownload(templateId, templateTitle, downloadFilename)

      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error('Download failed:', err)
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Anda tidak memiliki akses. Upgrade ke member.')
      } else {
        setError('Gagal mengunduh file. Coba lagi.')
      }
      setStatus('error')
    }
  }

  const buttonContent = () => {
    switch (status) {
      case 'downloading':
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {progress}%
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Selesai
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Gagal
          </>
        )
      default:
        return (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download
          </>
        )
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={disabled || status === 'downloading'}
        variant={status === 'error' ? 'destructive' : 'default'}
        size="sm"
        className="w-full"
      >
        {buttonContent()}
      </Button>
      {status === 'downloading' && (
        <Progress value={progress} className="h-1" />
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
