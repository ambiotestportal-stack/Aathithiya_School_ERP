'use client';
import React from 'react';
import { Inbox, Search, FileX, Users } from 'lucide-react';

type EmptyIcon = 'inbox' | 'search' | 'file' | 'users';

interface EmptyStateProps {
  icon?: EmptyIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const iconMap = { inbox: Inbox, search: Search, file: FileX, users: Users };

export default function EmptyState({ icon = 'inbox', title, description, actionLabel, onAction }: EmptyStateProps) {
  const Icon = iconMap[icon];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700">{title}</h3>
      {description && <p className="text-slate-400 mt-1 text-sm text-center max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
