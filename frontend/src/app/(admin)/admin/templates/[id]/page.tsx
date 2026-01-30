'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { FileIcon } from 'lucide-react'
import { getAdminTemplate, updateTemplate, Template } from '@/lib/api/admin'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

const templateSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(255, 'Judul maksimal 255 karakter'),
  description: z.string().optional(),
  isFreePreview: z.boolean(),
})

type TemplateFormData = z.infer<typeof templateSchema>

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = parseInt(params.id as string)

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  async function loadTemplate() {
    try {
      setLoading(true)
      const data = await getAdminTemplate(templateId)
      setTemplate(data)
      form.reset({
        title: data.title,
        description: data.description || '',
        isFreePreview: data.isFreePreview,
      })
    } catch (error) {
      console.error('Failed to load template:', error)
      setError('Gagal memuat template')
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: TemplateFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      await updateTemplate(templateId, {
        title: data.title,
        description: data.description || undefined,
        isFreePreview: data.isFreePreview,
      })
      router.push('/admin/templates')
    } catch (err) {
      setError('Gagal mengupdate template')
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Template</h1>
        </div>
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Template Tidak Ditemukan</h1>
        </div>
        <Button onClick={() => router.push('/admin/templates')}>
          Kembali ke Daftar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground">
          Update metadata template (file tidak dapat diubah)
        </p>
      </div>

      {/* File Info (Read-only) */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="text-sm font-medium mb-3">Informasi File</h3>
        <div className="flex items-start gap-3">
          <FileIcon className="h-8 w-8 text-muted-foreground mt-1" />
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">{template.originalFilename}</p>
            <p className="text-xs text-muted-foreground">
              Ukuran: {formatFileSize(template.fileSize)}
            </p>
            <p className="text-xs text-muted-foreground">
              Diupload: {format(new Date(template.createdAt), 'dd MMMM yyyy HH:mm', { locale: localeId })}
            </p>
            <p className="text-xs text-muted-foreground">
              Total download: {template.downloadCount}×
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Untuk mengganti file, hapus template ini dan upload ulang.
        </p>
      </div>

      {error && (
        <div className="border border-destructive bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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
