'use client';

import { Users, Mail, Clock, CalendarDays } from 'lucide-react';
import styles from '@/app/dashboard/page.module.css';

export default function StatsOverview({ stats }) {
  // stats: totalEntries, jlsReceived, waiting, avgWait
  const data = [
    { label: 'Total Entries', value: stats.totalEntries || 0, icon: Users, color: 'var(--color-primary-500)' },
    { label: 'JLs Received', value: stats.jlsReceived || 0, icon: Mail, color: 'var(--color-success)' },
    { label: 'Waiting', value: stats.waiting || 0, icon: Clock, color: 'var(--color-warning)' },
    { label: 'Avg Wait (days)', value: stats.avgWait || 0, icon: CalendarDays, color: 'var(--color-info)' },
  ];

  return (
    <div className={styles.statsGrid}>
      {data.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="card flex items-center justify-between animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex-col gap-2">
              <span className="text-sm font-semibold text-muted">{stat.label}</span>
              <span className="text-lg font-bold" style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>
                {stat.value}
              </span>
            </div>
            <div className={styles.iconWrapper} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
