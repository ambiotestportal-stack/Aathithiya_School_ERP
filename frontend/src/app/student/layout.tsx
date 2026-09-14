import { DashboardLayout } from '@/components/templates/DashboardLayout';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
