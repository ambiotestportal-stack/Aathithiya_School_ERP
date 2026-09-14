"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, BookOpen, UserCheck, 
  Wallet, FileText, CalendarCheck, Bus, Library, 
  Home, MessageSquare, Settings, CheckSquare,
  Award, Briefcase, GraduationCap, LogOut, History
} from 'lucide-react';

// ... (keep the same menu arrays)
interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const adminMenu: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'School Management', href: '/admin/school', icon: Home },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Academic', href: '/admin/academic', icon: BookOpen },
  { name: 'Academic Calendar', href: '/admin/academic/calendar', icon: CalendarCheck },
  { name: 'Timetable Hub', href: '/admin/academic/timetable', icon: CalendarCheck },
  { name: 'Student', href: '/admin/students', icon: GraduationCap },
  { name: 'Parent Management', href: '/admin/parents', icon: Users },
  { name: 'Staff', href: '/admin/staff', icon: Briefcase },
  { name: 'Fee Notice', href: '/admin/fee-notice', icon: FileText },
  { name: 'Finance', href: '/admin/finance', icon: Wallet },
  { name: 'Examination', href: '/admin/exam', icon: FileText },
  { name: 'Attendance', href: '/admin/attendance', icon: UserCheck },
  { name: 'Announcements', href: '/admin/communication', icon: MessageSquare },
  { name: 'Transport', href: '/admin/transport', icon: Bus },
  { name: 'Hostel', href: '/admin/hostel', icon: Home },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Recovery / Trash', href: '/admin/recovery', icon: History },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const studentMenu: SidebarItem[] = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/student/profile', icon: UserCheck },
  { name: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
  { name: 'Timetable', href: '/student/timetable', icon: CalendarCheck },
  { name: 'Homework', href: '/student/homework', icon: BookOpen },
  { name: 'Study Materials', href: '/student/materials', icon: FileText },
  { name: 'Exams', href: '/student/exams', icon: FileText },
  { name: 'Results', href: '/student/results', icon: Award },
  { name: 'Fees', href: '/student/fees', icon: Wallet },
  { name: 'Leave Request', href: '/student/leave', icon: CheckSquare },
  { name: 'Announcements', href: '/student/announcements', icon: MessageSquare },
];

const teacherMenu: SidebarItem[] = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { name: 'Profile & Settings', href: '/teacher/profile', icon: Settings },
  { name: 'My Classes', href: '/teacher/classes', icon: Users },
  { name: 'Attendance', href: '/teacher/attendance', icon: UserCheck },
  { name: 'Timetable', href: '/teacher/timetable', icon: CalendarCheck },
  { name: 'Homework', href: '/teacher/homework', icon: BookOpen },
  { name: 'Study Materials', href: '/teacher/materials', icon: FileText },
  { name: 'Marks Entry', href: '/teacher/marks', icon: Award },
  { name: 'Students', href: '/teacher/students', icon: GraduationCap },
  { name: 'Leave', href: '/teacher/leave', icon: CheckSquare },
  { name: 'Announcements', href: '/teacher/communication', icon: MessageSquare },
];

const parentMenu: SidebarItem[] = [
  { name: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
  { name: 'My Children', href: '/parent/children', icon: Users },
  { name: 'Attendance', href: '/parent/attendance', icon: CalendarCheck },
  { name: 'Academic Performance', href: '/parent/performance', icon: Award },
  { name: 'Homework', href: '/parent/homework', icon: BookOpen },
  { name: 'Timetable', href: '/parent/timetable', icon: CalendarCheck },
  { name: 'Fees & Payments', href: '/parent/fees', icon: Wallet },
  { name: 'Bus Tracking', href: '/parent/bus', icon: Bus },
  { name: 'Announcements', href: '/parent/announcements', icon: MessageSquare },
  { name: 'Leave Requests', href: '/parent/leave', icon: CheckSquare },
];

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    router.push('/');
  };

  let menuItems: SidebarItem[] = [];
  if (user?.role === 'SUPER_ADMIN') {
    menuItems = adminMenu;
  } else if (user?.role === 'SUB_ADMIN') {
    const allowed = user.customRole?.permissions || [];
    menuItems = adminMenu.filter(item => allowed.includes(item.href));
  } else if (user?.role === 'STUDENT') {
    menuItems = studentMenu;
  } else if (user?.role === 'TEACHER') {
    menuItems = teacherMenu;
  } else if (user?.role === 'PARENT') {
    menuItems = parentMenu;
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-100 shadow-2xl border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 flex-shrink-0 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-200 to-white">EduERP</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-indigo-400/90">School Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="mb-4 px-3 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Navigation</p>
            {user?.role && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                {user.role}
              </span>
            )}
          </div>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-indigo-600/15 text-indigo-300 font-semibold shadow-inner border border-indigo-500/20' 
                        : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active"
                        className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-r-full shadow-lg shadow-indigo-500/50"
                      />
                    )}
                    <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800/80 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3 text-rose-400 group-hover:text-rose-500 group-hover:scale-110 transition-all" />
            <span className="text-sm font-semibold group-hover:text-rose-300">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
