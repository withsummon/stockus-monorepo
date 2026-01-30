'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createResearch } from '@/lib/api/admin'
import { toast } from 'sonner'

const researchSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  summary: z.string(),
  content: z.string(),
  thumbnailUrl: z.string(),
  isFreePreview: z.boolean(),
  // Stock info section (all optional)
  stockSymbol: z.string(),
  stockName: z.string(),
  analystRating: z.string(),
  targetPrice: z.string(),
})

type ResearchFormData = z.infer<typeof researchSchema>

export default function NewResearchPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      thumbnailUrl: '',
      isFreePreview: false,
      stockSymbol: '',
      stockName: '',
      analystRating: '',
      targetPrice: '',
    },
  })

  async function onSubmit(data: ResearchFormData) {
    setIsSubmitting(true)

    try {
      // Convert empty strings to null for optional fields
      const payload = {
        title: data.title,
        summary: data.summary || undefined,
        content: data.content || undefined,
        thumbnailUrl: data.thumbnailUrl || null,
        isFreePreview: data.isFreePreview,
        stockSymbol: data.stockSymbol || null,
        stockName: data.stockName || null,
        analystRating: data.analystRating || null,
        targetPrice: data.targetPrice ? parseInt(data.targetPrice) : null,
      }

      await createResearch(payload)
      toast.success('Research report created successfully')
      router.push('/admin/research')
    } catch (error) {
      console.error('Failed to create research report:', error)
      toast.error('Failed to create research report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/research">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Research Report</h1>
          <p className="text-muted-foreground">
            Create a new research report with optional stock analysis
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Q4 2024 Market Analysis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief overview of the research report..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Short summary displayed in listing pages
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full research report content..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Full research content (supports HTML)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional thumbnail image URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFreePreview"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Free Preview</FormLabel>
                      <FormDescription>
                        Make this report available to free users
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Stock Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Analysis (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stockSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="AAPL" {...field} />
                      </FormControl>
                      <FormDescription>
                        Ticker symbol (e.g., AAPL, GOOGL)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Apple Inc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Full company name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="analystRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analyst Rating</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                        defaultValue={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Buy">Buy</SelectItem>
                          <SelectItem value="Hold">Hold</SelectItem>
                          <SelectItem value="Sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Price (IDR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Price target in Indonesian Rupiah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Research Report'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/research')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
