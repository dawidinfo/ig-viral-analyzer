import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Download, CreditCard, Calendar, Euro } from "lucide-react";

interface InvoicesTabProps {
  userId: number;
}

export function InvoicesTab({ userId }: InvoicesTabProps) {
  const { data: transactions, isLoading } = trpc.credits.getHistory.useQuery(
    { userId, limit: 50 },
    { enabled: !!userId }
  );

  // Filter only purchase transactions (positive credits)
  const purchases = transactions?.filter((t: any) => t.amount > 0 && t.type === 'purchase') || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPackageName = (amount: number) => {
    if (amount >= 350) return 'Business';
    if (amount >= 100) return 'Pro';
    if (amount >= 25) return 'Starter';
    return 'Credits';
  };

  const getPackagePrice = (amount: number) => {
    if (amount >= 19000) return '€199,99';
    if (amount >= 5500) return '€59,99';
    if (amount >= 2200) return '€24,99';
    if (amount >= 1100) return '€12,99';
    return '€0';
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">Lade Rechnungen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Rechnungen & Zahlungen
        </CardTitle>
        <CardDescription>
          Übersicht deiner Käufe und Transaktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Käufe getätigt</p>
            <p className="text-sm text-muted-foreground mt-2">
              Deine Rechnungen erscheinen hier nach dem ersten Kauf
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase: any, index: number) => (
              <div
                key={purchase.id || index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{getPackageName(purchase.amount)} Paket</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(purchase.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        +{purchase.amount} Credits
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{getPackagePrice(purchase.amount)}</p>
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      Bezahlt
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" title="Rechnung herunterladen">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {purchases.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtausgaben</p>
                <p className="text-2xl font-bold">
                  €{purchases.reduce((sum: number, p: any) => {
                    const price = parseInt(getPackagePrice(p.amount).replace('€', ''));
                    return sum + price;
                  }, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Gekaufte Credits</p>
                <p className="text-2xl font-bold text-primary">
                  {purchases.reduce((sum: number, p: any) => sum + p.amount, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
