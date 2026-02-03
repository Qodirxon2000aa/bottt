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
  
  // currentRate undefined bo'lsa bo'sh string bilan boshlaymiz
  const [newRate, setNewRate] = useState(currentRate?.toString() ?? "");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetType, setResetType] = useState<'weekly' | 'all-time' | 'contest'>('weekly');

  // Agar user hali yuklanmagan bo'lsa yoki admin emas bo'lsa
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-lg">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Admin emas bo'lsa qaytib ketamiz
  if (!user.isAdmin) {
    navigate('/');
    return null;
  }

  const handleUpdateRate = () => {
    const rate = parseInt(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Noto‘g‘ri qiymat', { description: 'Iltimos, musbat son kiriting' });
      return;
    }
    
    updateRate(rate);
    toast.success('Kurs muvaffaqiyatli yangilandi', {
      description: `Yangi kurs: 1 ⭐ = ${new Intl.NumberFormat('uz-UZ').format(rate)} UZS`
    });
  };

  const handleResetClick = (type: 'weekly' | 'all-time' | 'contest') => {
    setResetType(type);
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    if (resetType === 'weekly') {
      resetWeeklyLeaderboard();
      toast.success('Haftalik reyting jadvali tozalandi');
    } else if (resetType === 'all-time') {
      resetAllTimeLeaderboard();
      toast.success('Umumiy reyting jadvali tozalandi');
    } else if (resetType === 'contest') {
      resetContest();
      toast.success('Tanlov ma‘lumotlari tozalandi');
    }
    setShowResetDialog(false);
  };

  return (
    <div className="min-h-screen">
      <TopBar
        title="Admin Panel"
        subtitle="Kurs va reytinglarni boshqarish"
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
        <MessageBox type="warning" title="Admin huquqi">
          Siz kurslar va reyting jadvallarini to‘liq boshqarish huquqiga egasiz. Ushbu imkoniyatlardan mas'uliyat bilan foydalaning.
        </MessageBox>

        {/* Rate Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Kurs boshqaruvi</CardTitle>
            </div>
            <CardDescription>
              Yulduzlar → UZS kursini o‘rnatish
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-accent/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Joriy kurs</span>
                <Badge variant="default" className="text-xs">
                  Yangilangan {lastRateUpdate ? format(lastRateUpdate, 'HH:mm') : '—'}
                </Badge>
              </div>
              <p className="text-xl font-bold text-primary">
                1 ⭐ = {currentRate != null 
                  ? new Intl.NumberFormat('uz-UZ').format(currentRate) 
                  : "—"} UZS
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Yangi kurs (1 Yulduz uchun UZS)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Kursni kiriting"
                  className="flex-1"
                />
                <Button onClick={handleUpdateRate} className="gap-2">
                  <Save className="w-4 h-4" />
                  Saqlash
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
              <CardTitle>Reyting jadvallari</CardTitle>
            </div>
            <CardDescription>
              Reyting jadvallarini tozalash va ma'lumotlarni o‘chirish
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
                  <p className="font-medium">Umumiy reyting</p>
                  <p className="text-sm text-muted-foreground">Doimiy reyting</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResetClick('all-time')}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Tozalash
              </Button>
            </div>

            {/* Weekly Leaderboard */}
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Haftalik reyting</p>
                  <p className="text-sm text-muted-foreground">Har dushanba yangilanadi</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResetClick('weekly')}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Tozalash
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contest Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-telegram-gold" />
              <CardTitle>Tanlov boshqaruvi</CardTitle>
            </div>
            <CardDescription>
              Haftalik tanlov va sovrinlarni boshqarish
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-telegram-gold/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-telegram-gold" />
                </div>
                <div>
                  <p className="font-medium">Faol tanlov</p>
                  <p className="text-sm text-muted-foreground">Haftalik Yulduzlar poygasi</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleResetClick('contest')}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Tozalash
              </Button>
            </div>

            <Button variant="secondary" fullWidth className="gap-2">
              <Sparkles className="w-4 h-4" />
              Yangi tanlov yaratish
            </Button>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tezkor statistika</CardTitle>
            <CardDescription>Platforma faoliyati haqida qisqacha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Jami foydalanuvchilar</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Jami tranzaksiyalar</p>
                <p className="text-2xl font-bold">5,678</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Sotilgan yulduzlar</p>
                <p className="text-2xl font-bold">150K</p>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Daromad</p>
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
                    Tozalashni tasdiqlang
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-muted-foreground">
                    Bu amal orqaga qaytarib bo‘lmaydi
                  </AlertDialog.Description>
                </div>
              </div>

              <MessageBox type="error">
                <p className="text-sm">
                  Haqiqatan ham 
                  <strong>
                    {resetType === 'all-time' ? ' umumiy' : resetType === 'weekly' ? ' haftalik' : ' tanlov'}
                  </strong>{' '}
                  {resetType === 'contest' ? 'ma‘lumotlarini' : 'reyting jadvalini'} tozalamoqchimisiz?
                </p>
                <p className="text-sm mt-2">Barcha ma'lumotlar butunlay o‘chiriladi.</p>
              </MessageBox>

              <div className="flex gap-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="secondary" fullWidth>
                    Bekor qilish
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button variant="destructive" fullWidth onClick={confirmReset}>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Tozalashni tasdiqlash
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