'use client';
import React from 'react';

const shimmer = 'animate-pulse bg-slate-200 rounded';

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className={`h-6 w-48 ${shimmer}`} />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4 text-left"><div className={`h-4 w-20 ${shimmer}`} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-slate-50">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="p-4"><div className={`h-4 w-full max-w-[120px] ${shimmer}`} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <div className={`h-3 w-24 mb-3 ${shimmer}`} />
          <div className={`h-8 w-16 ${shimmer}`} />
        </div>
        <div className={`w-12 h-12 rounded-2xl ${shimmer}`} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className={`h-8 w-64 mb-2 ${shimmer}`} />
        <div className={`h-4 w-96 ${shimmer}`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`h-80 rounded-2xl ${shimmer}`} />
        <div className={`h-80 rounded-2xl ${shimmer}`} />
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className={`h-3 w-20 mb-2 ${shimmer}`} />
          <div className={`h-10 w-full rounded-xl ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
