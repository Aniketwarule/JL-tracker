'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function LocationBreakdown({ data }) {
  if (!data || data.length === 0) {
    return <div className="card text-center text-muted flex items-center justify-center" style={{ minHeight: '300px' }}>No location data available</div>;
  }

  return (
    <div className="card w-full" style={{ minHeight: '350px' }}>
      <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>JLs by Location</h3>
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="location" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--color-bg-main)' }}
              contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
              itemStyle={{ fontSize: '14px' }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="received" name="Received" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="waiting" name="Waiting" fill="var(--color-primary-200)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
