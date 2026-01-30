import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pembayaran Berhasil!</CardTitle>
          <CardDescription>
            Selamat! Anda sekarang menjadi StockUs Member
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Terima kasih atas kepercayaan Anda. Akun Anda telah diupgrade ke Member dan Anda sekarang memiliki akses penuh ke semua konten premium.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="font-medium">Apa yang bisa Anda akses sekarang:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Semua video kursus tanpa batas</li>
              <li>• Research reports lengkap</li>
              <li>• Investment templates premium</li>
              <li>• Private Discord community</li>
              <li>• Monthly live Q&A sessions</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Mulai Belajar</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/courses">Lihat Kursus</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
