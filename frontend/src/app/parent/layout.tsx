import { DashboardLayout } from '@/components/templates/DashboardLayout';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
