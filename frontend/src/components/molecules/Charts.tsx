"use client";

import React from 'react';
import { motion } from 'framer-motion';

// --- BAR CHART COMPONENT ---
export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export const CustomBarChart = ({ data, title, subtitle }: { data: BarChartItem[]; title: string; subtitle?: string }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)), 1);

  return (
    <div className="soft-card p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
        {data.map((item, index) => {
          const heightPercent = Math.min(100, Math.round((item.value / maxValue) * 100));
          const secondaryHeight = item.secondaryValue !== undefined ? Math.min(100, Math.round((item.secondaryValue / maxValue) * 100)) : null;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-1 px-2.5 rounded-xl shadow-lg whitespace-nowrap z-20 pointer-events-none border border-slate-700">
                {item.label}: {item.value} {item.secondaryValue !== undefined ? `| ${item.secondaryValue}` : ''}
              </div>

              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Main Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className={`w-full rounded-t-xl transition-all ${item.color || 'bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-indigo-700 group-hover:to-indigo-600 shadow-md shadow-indigo-500/20'}`}
                />
                {/* Secondary Bar if provided */}
                {secondaryHeight !== null && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${secondaryHeight}%` }}
                    transition={{ duration: 0.6, delay: index * 0.08 + 0.05 }}
                    className="w-full rounded-t-xl bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 transition-all"
                  />
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- LINE / AREA CHART COMPONENT ---
export interface LineChartItem {
  label: string;
  value: number;
}

export const CustomLineChart = ({ data, title, subtitle, color = '#6366f1' }: { data: LineChartItem[]; title: string; subtitle?: string; color?: string }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const width = 320;
  const height = 120;
  const padding = 15;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - minValue) / range) * (height - padding * 2);
    return { x, y, value: d.value, label: d.label };
  });

  const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1]?.x} ${height} L ${points[0]?.x} ${height} Z`;

  return (
    <div className="soft-card p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id={`gradient-${title.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            d={areaD}
            fill={`url(#gradient-${title.replace(/[^a-zA-Z0-9]/g, '')})`}
          />

          {/* Line Path */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke={color} strokeWidth="3" className="transition-transform group-hover:scale-150 shadow-md" />
            </g>
          ))}
        </svg>

        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2 px-1">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DONUT / PIE CHART COMPONENT ---
export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

export const CustomDonutChart = ({ data, title, subtitle, totalLabel }: { data: DonutChartItem[]; title: string; subtitle?: string; totalLabel?: string }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let accumulatedAngle = 0;

  return (
    <div className="soft-card p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              const percentage = item.value / total;
              const strokeDasharray = `${percentage * 283} 283`;
              const strokeDashoffset = -accumulatedAngle * 283;
              accumulatedAngle += percentage;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{totalLabel || 'Total'}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 w-full">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-lg shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

