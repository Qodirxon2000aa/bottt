import { useNavigate } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { Sparkles, TrendingUp, Trophy, Clock, Wallet, ArrowRight, Gift } from 'lucide-react';
import { format } from 'date-fns';

export function HomePage() {
  const navigate = useNavigate();
  const { user, currentRate, lastRateUpdate, transactions, contest } = useApp();

  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1">Stars Market</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user.displayName}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xl">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Balance Card */}
        <Card className="shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Your Balance</span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-3xl font-bold">{formatUZS(user.balanceUZS)}</p>
              <span className="text-muted-foreground">UZS</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-telegram-gold" />
                <span className="text-sm text-muted-foreground">Stars Purchased</span>
              </div>
              <span className="font-medium">{formatUZS(user.starsSpent)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 space-y-4">
        {/* Current Rate */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium">Current Rate</span>
              </div>
              <Badge variant="default" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Updated {format(lastRateUpdate, 'HH:mm')}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">1 ⭐ = {formatUZS(currentRate)}</p>
              <span className="text-muted-foreground">UZS</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/buy')}
            className="h-auto flex-col gap-2 py-4"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">Buy Stars</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/leaderboard')}
            className="h-auto flex-col gap-2 py-4"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Leaderboard</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/leaderboard?tab=contest')}
            className="h-auto flex-col gap-2 py-4"
          >
            <Gift className="w-5 h-5" />
            <span className="text-xs">Contest</span>
          </Button>
        </div>

        {/* Weekly Contest Banner */}
        {contest && contest.isActive && (
          <Card 
            className="bg-gradient-to-r from-telegram-gold/10 to-primary/10 border-telegram-gold/30 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/leaderboard?tab=contest')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-telegram-gold/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-telegram-gold" />
                  </div>
                  <div>
                    <p className="font-medium">{contest.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Win up to 1,000,000 UZS!
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
              {contest.isParticipating && contest.currentUserRank && (
                <div className="mt-3 p-2 rounded-lg bg-background/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Rank</span>
                    <span className="font-medium">#{contest.currentUserRank}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <Card key={tx.id}>
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white flex-shrink-0">
                      {tx.recipientDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tx.recipientDisplayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(tx.timestamp, 'MMM d, HH:mm')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium">{tx.stars} ⭐</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUZS(tx.totalUZS)} UZS
                      </p>
                    </div>
                    <Badge
                      variant={
                        tx.status === 'completed'
                          ? 'success'
                          : tx.status === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-4 text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/buy')}
                    className="mt-3"
                  >
                    Send Your First Stars
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
