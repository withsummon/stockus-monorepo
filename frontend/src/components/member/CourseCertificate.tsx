'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/button'
import { Award, Download, Loader2 } from 'lucide-react'
import { isCourseComplete, getCourseProgress } from '@/lib/course-progress'

interface CourseCertificateProps {
  courseId: number
  courseTitle: string
  userName: string
}

export function CourseCertificate({ courseId, courseTitle, userName }: CourseCertificateProps) {
  const [generating, setGenerating] = useState(false)

  const isComplete = isCourseComplete(courseId)
  const progress = getCourseProgress(courseId)

  if (!isComplete) {
    return null // Don't show if course not complete
  }

  const completedDate = progress?.completedAt
    ? new Date(progress.completedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('id-ID')

  const generateCertificate = async () => {
    setGenerating(true)

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Background border
      doc.setDrawColor(59, 130, 246) // Primary blue
      doc.setLineWidth(3)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

      // Inner border
      doc.setLineWidth(1)
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

      // Title
      doc.setFontSize(36)
      doc.setTextColor(59, 130, 246)
      doc.text('SERTIFIKAT', pageWidth / 2, 50, { align: 'center' })

      doc.setFontSize(18)
      doc.setTextColor(100, 100, 100)
      doc.text('Penyelesaian Kursus', pageWidth / 2, 62, { align: 'center' })

      // Recipient name
      doc.setFontSize(28)
      doc.setTextColor(30, 30, 30)
      doc.text(userName, pageWidth / 2, 90, { align: 'center' })

      // Description
      doc.setFontSize(14)
      doc.setTextColor(80, 80, 80)
      doc.text('telah berhasil menyelesaikan kursus', pageWidth / 2, 105, { align: 'center' })

      // Course title
      doc.setFontSize(22)
      doc.setTextColor(59, 130, 246)
      doc.text(courseTitle, pageWidth / 2, 120, { align: 'center' })

      // Completion date
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Diselesaikan pada ${completedDate}`, pageWidth / 2, 145, { align: 'center' })

      // Footer
      doc.setFontSize(10)
      doc.text('Stockus - Platform Edukasi Investasi', pageWidth / 2, 175, { align: 'center' })

      // Save
      doc.save(`Sertifikat_${courseTitle.replace(/\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error('Failed to generate certificate:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button onClick={generateCertificate} disabled={generating} className="gap-2">
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Membuat Sertifikat...
        </>
      ) : (
        <>
          <Award className="h-4 w-4" />
          Download Sertifikat
        </>
      )}
    </Button>
  )
}
