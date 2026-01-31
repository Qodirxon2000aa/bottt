import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ChipGroup, Chip } from '@/app/components/ui/Chip';
import { History, Sparkles, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';
import { Transaction } from '@/app/context/AppContext';

type FilterType = 'all' | 'completed' | 'pending' | 'failed';

export function HistoryPage() {
  const { transactions } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.status === filter);

  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Transaction History" subtitle="View all your star purchases" />

      <div className="p-4 space-y-4">
        {/* Filters */}
        <ChipGroup>
          <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          <Chip selected={filter === 'completed'} onClick={() => setFilter('completed')}>
            Completed
          </Chip>
          <Chip selected={filter === 'pending'} onClick={() => setFilter('pending')}>
            Pending
          </Chip>
          <Chip selected={filter === 'failed'} onClick={() => setFilter('failed')}>
            Failed
          </Chip>
        </ChipGroup>

        {/* Transaction List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <Card
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white flex-shrink-0">
                      {tx.recipientDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tx.recipientDisplayName}</p>
                      <p className="text-sm text-muted-foreground">@{tx.recipientUsername}</p>
                    </div>
                    {getStatusIcon(tx.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-telegram-gold" />
                        <span className="font-medium">{tx.stars}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {formatUZS(tx.totalUZS)} UZS
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(tx.status) as any} className="text-[10px]">
                      {tx.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {format(tx.timestamp, 'MMM d, yyyy • HH:mm')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<History className="w-16 h-16" />}
            title="No transactions found"
            description={
              filter === 'all'
                ? 'Start buying stars to see your transaction history here'
                : `No ${filter} transactions found`
            }
          />
        )}
      </div>

      {/* Transaction Details Dialog */}
      <Dialog.Root open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50 max-h-[80vh] overflow-y-auto">
            {selectedTx && (
              <Card className="shadow-2xl">
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl">
                      {selectedTx.recipientDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <Dialog.Title className="text-xl font-medium mb-1">
                      {selectedTx.recipientDisplayName}
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      @{selectedTx.recipientUsername}
                    </Dialog.Description>
                  </div>

                  {/* Status */}
                  <div className="flex justify-center">
                    <Badge variant={getStatusBadge(selectedTx.status) as any} className="text-sm px-4 py-1.5">
                      {getStatusIcon(selectedTx.status)}
                      <span className="capitalize">{selectedTx.status}</span>
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono text-sm">{selectedTx.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Stars</span>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-telegram-gold" />
                        <span className="font-medium">{selectedTx.stars}</span>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">{formatUZS(selectedTx.rateUZS)} UZS</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">{formatUZS(selectedTx.totalUZS)} UZS</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="text-sm">{format(selectedTx.timestamp, 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-2 bg-accent/20 rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">Transaction Status</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Payment Confirmed</p>
                          <p className="text-xs text-muted-foreground">Payment processed successfully</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedTx.status === 'completed' || selectedTx.status === 'pending'
                            ? 'bg-success'
                            : 'bg-muted'
                        }`}>
                          {selectedTx.status === 'pending' ? (
                            <Loader2 className="w-4 h-4 text-success-foreground animate-spin" />
                          ) : selectedTx.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Sending Stars</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTx.status === 'completed' 
                              ? 'Stars sent to recipient'
                              : selectedTx.status === 'pending'
                              ? 'Processing...'
                              : 'Waiting...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedTx.status === 'completed'
                            ? 'bg-success'
                            : 'bg-muted'
                        }`}>
                          {selectedTx.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Delivered</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTx.status === 'completed' 
                              ? 'Transaction completed'
                              : 'Waiting for confirmation'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <Dialog.Close asChild>
                    <button className="w-full h-11 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors">
                      Close
                    </button>
                  </Dialog.Close>
                </div>
              </Card>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
