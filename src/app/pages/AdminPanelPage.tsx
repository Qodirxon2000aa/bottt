import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Badge } from '@/app/components/ui/Badge';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AdminPanelPage() {
  const navigate = useNavigate();
  const { user, currentRate, lastRateUpdate, updateRate } = useApp();

  const [newRate, setNewRate] = useState(currentRate?.toString() ?? "");

  /* ===================== STATS STATE ===================== */
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /* ===================== FETCH STATS ===================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          'https://m4746.myxvest.ru/webapp/statistics.php'
        );
        const data = await res.json();

        if (data.ok) {
          setStats(data);
        } else {
          toast.error('Statistika yuklanmadi');
        }
      } catch (err) {
        toast.error('Statistika serverida xatolik');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  /* ===================== LOADING ===================== */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  /* ===================== ADMIN CHECK ===================== */
  if (!user.isAdmin) {
    navigate('/');
    return null;
  }

  /* ===================== RATE UPDATE ===================== */
  const handleUpdateRate = () => {
    const rate = parseInt(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Noto‘g‘ri qiymat', {
        description: 'Iltimos, musbat son kiriting'
      });
      return;
    }

    updateRate(rate);
    toast.success('Kurs yangilandi', {
      description: `1 ⭐ = ${new Intl.NumberFormat('uz-UZ').format(rate)} UZS`
    });
  };

  return (
    <div className="min-h-screen">
      {/* ===================== TOP BAR ===================== */}
      <TopBar
        title="Admin Panel"
        subtitle="Kurs va statistika"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center"
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
        {/* ===================== RATE MANAGEMENT ===================== */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Kurs boshqaruvi</CardTitle>
            </div>
            <CardDescription>
              Yulduz → UZS kursini o‘rnatish
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-3 bg-accent/30 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Joriy kurs</span>
                <Badge className="text-xs">
                  {lastRateUpdate ? format(lastRateUpdate, 'HH:mm') : '—'}
                </Badge>
              </div>
              <p className="text-xl font-bold">
                1 ⭐ = {currentRate
                  ? new Intl.NumberFormat('uz-UZ').format(currentRate)
                  : '—'} UZS
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Masalan: 1500"
              />
              <Button onClick={handleUpdateRate} className="gap-2">
                <Save className="w-4 h-4" />
                Saqlash
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ===================== STATS ===================== */}
        <Card>
          <CardHeader>
            <CardTitle>Tezkor statistika</CardTitle>
            <CardDescription>
              Oxirgi yangilanish: {stats?.date ?? '—'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {statsLoading ? (
              <p className="text-sm text-muted-foreground">
                Statistika yuklanmoqda...
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-accent/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Jami foydalanuvchilar</p>
                  <p className="text-2xl font-bold">{stats.users.total}</p>
                </div>

                <div className="p-3 bg-accent/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Bugungi foydalanuvchilar</p>
                  <p className="text-2xl font-bold">{stats.users.today}</p>
                </div>

                <div className="p-3 bg-accent/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Sotilgan yulduzlar</p>
                  <p className="text-2xl font-bold">{stats.stars.sold}</p>
                </div>

                <div className="p-3 bg-accent/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Yulduzlar summasi</p>
                  <p className="text-2xl font-bold">
                    {stats.stars.summa.toLocaleString('uz-UZ')}
                  </p>
                </div>

                {/* 🆕 BUGUNGI SAVDO */}
                <div className="p-3 bg-primary/10 rounded-lg col-span-2">
                  <p className="text-xs text-muted-foreground">Bugungi savdo</p>
                  <p className="text-3xl font-bold text-primary">
                    {stats.turnover.today.toLocaleString('uz-UZ')} UZS
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
