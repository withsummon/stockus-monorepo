import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckoutPendingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clock className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Menunggu Pembayaran</CardTitle>
          <CardDescription>
            Pembayaran Anda sedang diproses
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Silakan selesaikan pembayaran Anda sesuai dengan instruksi yang diberikan. Akun Anda akan otomatis diupgrade setelah pembayaran dikonfirmasi.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 text-left">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Catatan:</strong> Jika Anda menggunakan transfer bank atau e-wallet, pembayaran biasanya dikonfirmasi dalam beberapa menit. Anda akan menerima email konfirmasi setelah pembayaran berhasil.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Ke Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
