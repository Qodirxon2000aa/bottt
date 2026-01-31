import { Outlet } from 'react-router';
import { BottomNav } from '@/app/components/BottomNav';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
