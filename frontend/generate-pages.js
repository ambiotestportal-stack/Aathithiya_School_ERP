const fs = require('fs');
const path = require('path');

const adminRoutes = ['school', 'academic', 'students', 'staff', 'finance', 'exam', 'attendance', 'transport', 'library', 'hostel', 'communication', 'reports', 'settings'];
const studentRoutes = ['profile', 'attendance', 'timetable', 'homework', 'materials', 'exams', 'results', 'fees', 'leave', 'announcements', 'library', 'certificates'];
const teacherRoutes = ['classes', 'attendance', 'timetable', 'homework', 'assignments', 'marks', 'students', 'communication', 'leave', 'salary'];
const parentRoutes = ['children', 'attendance', 'performance', 'homework', 'timetable', 'fees', 'bus', 'announcements', 'leave', 'communication'];

const routes = {
  admin: adminRoutes,
  student: studentRoutes,
  teacher: teacherRoutes,
  parent: parentRoutes
};

const getTemplate = (title) => `"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4"
      >
        <Hammer className="w-10 h-10" />
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-slate-800"
      >
        ${title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 max-w-md text-center"
      >
        This module is currently under construction. Please check back later as we roll out more features!
      </motion.p>
    </div>
  );
}
`;

for (const [role, paths] of Object.entries(routes)) {
  for (const p of paths) {
    const dir = path.join('src', 'app', role, p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const title = p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    fs.writeFileSync(path.join(dir, 'page.tsx'), getTemplate(title));
  }
}
console.log('Successfully generated all placeholder pages!');
