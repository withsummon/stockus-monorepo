'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileIcon, X } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const templateSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(255, 'Judul maksimal 255 karakter'),
  description: z.string().optional(),
  isFreePreview: z.boolean(),
})

type TemplateFormData = z.infer<typeof templateSchema>

export default function NewTemplatePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      isFreePreview: false,
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Tipe file tidak didukung. Gunakan Excel, Word, atau PDF.')
        return
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Ukuran file maksimal 10MB')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  function removeFile() {
    setFile(null)
    setError(null)
  }

  async function onSubmit(data: TemplateFormData) {
    if (!file) {
      setError('File wajib diupload')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      formData.append('isFreePreview', String(data.isFreePreview))

      const res = await fetch(`${API_URL}/templates`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // No Content-Type header - browser sets it with boundary
      })

      if (res.ok) {
        router.push('/admin/templates')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Gagal mengupload template')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengupload')
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Template</h1>
        <p className="text-muted-foreground">
          Upload file template baru untuk member
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">File Template *</label>
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:underline">
                      Klik untuk upload
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.pdf,.docx,.doc"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excel, Word, atau PDF (maksimal 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul *</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Investment Checklist Template" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Deskripsi singkat tentang template ini..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Jelaskan kegunaan dan cara menggunakan template
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Free Preview */}
          <FormField
            control={form.control}
            name="isFreePreview"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Gratis untuk semua pengguna
                  </FormLabel>
                  <FormDescription>
                    Jika dicentang, user gratis juga bisa mengunduh template ini
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? 'Mengupload...' : 'Upload Template'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/templates')}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
