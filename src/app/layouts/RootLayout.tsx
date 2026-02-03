import { Outlet } from 'react-router';
import { BottomNav } from '@/app/components/BottomNav';
import ChekListener from "@/app/pages/ChekListener";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto">
       <ChekListener />
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
