import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'

interface ResearchDetailCardProps {
  stockSymbol: string | null
  stockName: string | null
  analystRating: string | null
  targetPrice: number | null
}

export function ResearchDetailCard({
  stockSymbol,
  stockName,
  analystRating,
  targetPrice,
}: ResearchDetailCardProps) {
  if (!stockSymbol && !analystRating && !targetPrice) {
    return null
  }

  const getRatingColor = (rating: string | null) => {
    if (!rating) return 'secondary'
    const lower = rating.toLowerCase()
    if (lower.includes('buy') || lower.includes('strong')) return 'default'
    if (lower.includes('hold') || lower.includes('neutral')) return 'secondary'
    if (lower.includes('sell') || lower.includes('underperform')) return 'destructive'
    return 'secondary'
  }

  const getRatingIcon = (rating: string | null) => {
    if (!rating) return null
    const lower = rating.toLowerCase()
    if (lower.includes('buy') || lower.includes('strong')) return <TrendingUp className="h-4 w-4" />
    if (lower.includes('sell') || lower.includes('underperform')) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informasi Saham</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stockSymbol && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Simbol</span>
            <span className="font-mono font-medium">{stockSymbol}</span>
          </div>
        )}
        {stockName && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Nama</span>
            <span className="font-medium">{stockName}</span>
          </div>
        )}
        {analystRating && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rating</span>
            <Badge variant={getRatingColor(analystRating)} className="flex items-center gap-1">
              {getRatingIcon(analystRating)}
              {analystRating}
            </Badge>
          </div>
        )}
        {targetPrice && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Target Harga</span>
            <span className="font-medium flex items-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              Rp {targetPrice.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
