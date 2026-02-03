import { Outlet, useLocation } from 'react-router';
import { BottomNav } from '@/app/components/BottomNav';
import ChekListener from "@/app/pages/ChekListener";

export function RootLayout() {
  const location = useLocation();

  // 🔥 faqat shu pageda footer yo‘q
  const hideBottomNav = location.pathname === "/chek";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto">
        <ChekListener />
        <Outlet />
      </div>

      {/* 🔻 footer shart bilan */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
