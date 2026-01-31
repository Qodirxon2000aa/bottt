import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ListItemSkeleton } from '@/app/components/ui/Skeleton';
import { PodiumCard, LeaderboardRow } from '@/app/components/LeaderboardComponents';
import { ContestCard } from '@/app/components/ContestCard';
import { Trophy, Calendar, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, leaderboard, weeklyLeaderboard, contest, resetWeeklyLeaderboard, resetAllTimeLeaderboard, resetContest } = useApp();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all-time');
  const [loading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetType, setResetType] = useState<'weekly' | 'all-time' | 'contest'>('weekly');

  const handleReset = (type: 'weekly' | 'all-time' | 'contest') => {
    setResetType(type);
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    if (resetType === 'weekly') {
      resetWeeklyLeaderboard();
      toast.success('Weekly leaderboard reset successfully');
    } else if (resetType === 'all-time') {
      resetAllTimeLeaderboard();
      toast.success('All-time leaderboard reset successfully');
    } else if (resetType === 'contest') {
      resetContest();
      toast.success('Contest reset successfully');
    }
    setShowResetDialog(false);
  };

  const currentLeaderboard = activeTab === 'weekly' ? weeklyLeaderboard : leaderboard;

  return (
    <div className="min-h-screen">
      <TopBar
        title="Leaderboard"
        subtitle="Top Star Buyers"
        action={
          user.isAdmin && (
            <Badge variant="gold" className="gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
          )
        }
      />

      <div className="pb-4">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab List */}
          <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
            <Tabs.List className="flex px-4 h-12">
              <Tabs.Trigger
                value="all-time"
                className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
              >
                <Trophy className="w-4 h-4" />
                All-Time
              </Tabs.Trigger>
              <Tabs.Trigger
                value="weekly"
                className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Weekly
              </Tabs.Trigger>
              <Tabs.Trigger
                value="contest"
                className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Contest
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          {/* All-Time Tab */}
          <Tabs.Content value="all-time" className="p-4 space-y-4">
            {/* Admin Controls */}
            {user.isAdmin && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium">Admin Controls</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReset('all-time')}
                  >
                    Reset All-Time
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <>
                <PodiumCard entries={leaderboard} />
                <div className="space-y-2">
                  {leaderboard.slice(3).map((entry) => (
                    <LeaderboardRow
                      key={entry.username}
                      entry={entry}
                      isCurrentUser={entry.username === user.username}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Trophy className="w-16 h-16" />}
                title="No leaderboard data"
                description="Be the first to buy stars and claim the top spot!"
                action={
                  <Button variant="primary" onClick={() => navigate('/buy')}>
                    Buy Stars
                  </Button>
                }
              />
            )}
          </Tabs.Content>

          {/* Weekly Tab */}
          <Tabs.Content value="weekly" className="p-4 space-y-4">
            {/* Admin Controls */}
            {user.isAdmin && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium">Admin Controls</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReset('weekly')}
                  >
                    Reset Weekly
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            ) : weeklyLeaderboard.length > 0 ? (
              <>
                <PodiumCard entries={weeklyLeaderboard} />
                <div className="space-y-2">
                  {weeklyLeaderboard.slice(3).map((entry) => (
                    <LeaderboardRow
                      key={entry.username}
                      entry={entry}
                      isCurrentUser={entry.username === user.username}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Calendar className="w-16 h-16" />}
                title="No weekly data yet"
                description="Weekly leaderboard resets every Monday. Start buying stars to compete!"
                action={
                  <Button variant="primary" onClick={() => navigate('/buy')}>
                    Buy Stars
                  </Button>
                }
              />
            )}
          </Tabs.Content>

          {/* Contest Tab */}
          <Tabs.Content value="contest" className="p-4 space-y-4">
            {/* Admin Controls */}
            {user.isAdmin && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium">Admin Controls</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReset('contest')}
                  >
                    Reset Contest
                  </Button>
                </div>
              </div>
            )}

            {contest ? (
              <>
                <ContestCard 
                  contest={contest} 
                  onBuyStars={() => navigate('/buy')} 
                />

                {/* Contest Rules */}
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
                    <span className="font-medium">Contest Rules</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 p-4 bg-card rounded-xl border border-border text-sm text-muted-foreground space-y-2">
                    <p>• Contest runs from Monday to Sunday each week</p>
                    <p>• Points are earned by purchasing Telegram Stars</p>
                    <p>• 1 Star purchased = 1 point</p>
                    <p>• Winners are announced on Monday</p>
                    <p>• Prizes are distributed within 24 hours</p>
                    <p>• Admin reserves the right to disqualify suspicious activity</p>
                  </div>
                </details>

                {/* Weekly Leaderboard for Contest */}
                {weeklyLeaderboard.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Current Standings</h3>
                    <div className="space-y-2">
                      {weeklyLeaderboard.map((entry) => (
                        <LeaderboardRow
                          key={entry.username}
                          entry={entry}
                          isCurrentUser={entry.username === user.username}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<Sparkles className="w-16 h-16" />}
                title="No active contest"
                description="Check back later for new contests and exciting prizes!"
              />
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog.Root open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-card rounded-xl shadow-2xl p-6 z-50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <AlertDialog.Title className="font-medium">
                    Confirm Reset
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-muted-foreground">
                    This action cannot be undone
                  </AlertDialog.Description>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to reset the{' '}
                <strong>
                  {resetType === 'all-time' ? 'all-time' : resetType === 'weekly' ? 'weekly' : 'contest'}
                </strong>{' '}
                leaderboard? All data will be permanently deleted.
              </p>

              <div className="flex gap-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="secondary" fullWidth>
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button variant="destructive" fullWidth onClick={confirmReset}>
                    Reset
                  </Button>
                </AlertDialog.Action>
              </div>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
