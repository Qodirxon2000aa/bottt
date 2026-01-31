import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Badge } from '@/app/components/ui/Badge';
import { MessageBox } from '@/app/components/ui/EmptyState';
import { 
  ArrowLeft, 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Sparkles, 
  Shield,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AdminPanelPage() {
  const navigate = useNavigate();
  const { user, currentRate, lastRateUpdate, updateRate, resetWeeklyLeaderboard, resetAllTimeLeaderboard, resetContest } = useApp();
  
  const [newRate, setNewRate] = useState(currentRate.toString());
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetType, setResetType] = useState<'weekly' | 'all-time' | 'contest'>('weekly');

  // Redirect if not admin
  if (!user.isAdmin) {
    navigate('/');
    return null;
  }

  const handleUpdateRate = () => {
    const rate = parseInt(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Invalid rate', { description: 'Please enter a valid positive number' });
      return;
    }
    
    updateRate(rate);
    toast.success('Rate updated successfully', {
      description: `New rate: 1 ⭐ = ${new Intl.NumberFormat('uz-UZ').format(rate)} UZS`
    });
  };

  const handleResetClick = (type: 'weekly' | 'all-time' | 'contest') => {
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

  return (
    <div className="min-h-screen">
      <TopBar
        title="Admin Panel"
        subtitle="Manage rates and leaderboards"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        action={
          <Badge variant="gold" className="gap-1">
            <Shield className="w-3 h-3" />
            Admin
          </Badge>
        }
      />

      <div className="p-4 space-y-6">
        {/* Warning */}
        <MessageBox type="warning" title="Admin Access">
          You have full control over rates and leaderboards. Use these powers responsibly.
        </MessageBox>

        {/* Rate Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Rate Management</CardTitle>
            </div>
            <CardDescription>
              Set the exchange rate for Stars to UZS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-accent/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Current Rate</span>
                <Badge variant="default" className="text-xs">
                  Updated {format(lastRateUpdate, 'HH:mm')}
                </Badge>
              </div>
              <p className="text-xl font-bold text-primary">
                1 ⭐ = {new Intl.NumberFormat('uz-UZ').format(currentRate)} UZS
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Rate (UZS per 1 Star)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Enter rate"
                  className="flex-1"
                />
                <Button onClick={handleUpdateRate} className="gap-2">
                  <Save className="w-4 h-4" />
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-telegram-gold" />
              <CardTitle>Leaderboard Management</CardTitle>
            </div>
            <CardDescription>
              Reset leaderboards and clear all data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* All-Time Leaderboard */}
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">All-Time Leaderboard</p>
                  <p className="text-sm text-muted-foreground">Permanent rankings</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResetClick('all-time')}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Weekly Leaderboard */}
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Weekly Leaderboard</p>
                  <p className="text-sm text-muted-foreground">Resets every Monday</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResetClick('weekly')}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contest Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-telegram-gold" />
              <CardTitle>Contest Management</CardTitle>
            </div>
            <CardDescription>
              Manage weekly contests and prizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-telegram-gold/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-telegram-gold" />
                </div>
                <div>
                  <p className="font-medium">Active Contest</p>
                  <p className="text-sm text-muted-foreground">Weekly Stars Sprint</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResetClick('contest')}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            <Button variant="secondary" fullWidth className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create New Contest
            </Button>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-bold">5,678</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Stars Sold</p>
                <p className="text-2xl font-bold">150K</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-2xl font-bold">225M</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

              <MessageBox type="error">
                <p className="text-sm">
                  Are you sure you want to reset the{' '}
                  <strong>
                    {resetType === 'all-time' ? 'all-time' : resetType === 'weekly' ? 'weekly' : 'contest'}
                  </strong>{' '}
                  {resetType === 'contest' ? 'data' : 'leaderboard'}?
                </p>
                <p className="text-sm mt-2">All data will be permanently deleted.</p>
              </MessageBox>

              <div className="flex gap-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="secondary" fullWidth>
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button variant="destructive" fullWidth onClick={confirmReset}>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Confirm Reset
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
