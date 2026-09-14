"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignmentsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/teacher/homework');
  }, [router]);

  return <div className="p-12 text-center text-slate-500">Redirecting to Homework module...</div>;
}
