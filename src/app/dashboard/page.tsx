'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/calendar');
  }, [router]);

  return (
    <div className="flex-grow flex items-center justify-center bg-[#f9f9f8] min-h-screen">
      <div className="text-xs font-bold text-[#003527] flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#003527] border-t-transparent rounded-full animate-spin" />
        Laden...
      </div>
    </div>
  );
}