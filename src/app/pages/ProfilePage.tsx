import { useNavigate } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { useTelegram } from '@/app/context/TelegramContext';
import { useTheme } from '@/app/context/ThemeContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { 
  Shield, 
  Moon, 
  Sun, 
  ChevronRight, 
  Settings, 
  HelpCircle,
  LogOut,
  Mail,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user: appUser } = useApp();
  const { user: tgUser, apiUser, orders, refreshUser } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Ma'lumotlarni birlashtirish
  const userBalance = Number(apiUser?.balance || 0);
  const totalStarsSpent = orders?.reduce((sum, order) => {
    return sum + (Number(order.amount) || 0);
  }, 0) || 0;

  const menuItems = [
    {
      icon: Settings,
      label: 'Sozlamalar',
      onClick: () => {},
      badge: null
    },
    {
      icon: HelpCircle,
      label: 'Yordam',
      onClick: () => {},
      badge: null
    },
    {
      icon: Mail,
      label: 'Biz bilan ulanish',
      onClick: () => {},
      badge: null
    }
  ];

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Profile" 
        subtitle="Manage your account"
        action={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="p-4 space-y-6">
        {/* User Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/20 to-transparent p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl ring-4 ring-background overflow-hidden">
                {tgUser?.photo_url ? (
                  <img 
                    src={tgUser.photo_url} 
                    alt={tgUser?.first_name || 'User'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Agar rasm yuklanmasa, harfni ko'rsatish
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = `<span>${(tgUser?.first_name?.[0] || 'U').toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span>{(tgUser?.first_name?.[0] || 'U').toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-medium truncate">
                    {tgUser?.first_name || 'User'} {tgUser?.last_name || ''}
                  </h2>
                  {appUser.isAdmin && (
                    <Badge variant="gold" className="gap-1 text-[10px]">
                      <Shield className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{tgUser?.username || '@username'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Hisoningiz</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(userBalance)} UZS
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Ishlatilgan Starslar</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(totalStarsSpent)} ⭐
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Info */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-medium mb-3">Siz haqingizda</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono">{tgUser?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Username</span>
                <span>{tgUser?.username || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Umumiy buyurtmalar</span>
                <span className="font-medium">{orders?.length || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Account Turi</span>
                <Badge variant={tgUser?.isTelegram ? 'success' : 'default'}>
                  {tgUser?.isTelegram ? 'Telegram' : 'Web'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-telegram-gold" />
                )}
                <div>
                  <p className="font-medium">Mavzu</p>
                  <p className="text-sm text-muted-foreground capitalize">{theme} mode</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span 
                  className={`block w-5 h-5 bg-background rounded-full shadow-sm transition-transform ${
                    theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Panel Access */}
        {appUser.isAdmin && (
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
            onClick={() => navigate('/admin')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Admin Panel</p>
                    <p className="text-sm text-muted-foreground">Manage rates & leaderboards</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                onClick={item.onClick}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <p className="font-medium">{item.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && <Badge variant="default">{item.badge}</Badge>}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logout */}
        <Card className="border-destructive/30">
          <CardContent className="pt-4">
            <button className="w-full flex items-center justify-center gap-2 text-destructive">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Chiqish</span>
            </button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground pb-4">
          <p>Stars Market v1.0.0</p>
          <p className="text-xs mt-1">Made with ❤️ @qiyossiz</p>
        </div>
      </div>
    </div>
  );
}