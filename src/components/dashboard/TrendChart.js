'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="card text-center text-muted flex items-center justify-center" style={{ minHeight: '300px' }}>No trend data available</div>;
  }

  return (
    <div className="card w-full" style={{ minHeight: '350px' }}>
      <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>JL Timeline Trend</h3>
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWaiting" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
              itemStyle={{ fontSize: '14px' }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="received" name="Received" stroke="var(--color-primary-600)" fillOpacity={1} fill="url(#colorReceived)" />
            <Area type="monotone" dataKey="waiting" name="Waiting" stroke="var(--color-warning)" fillOpacity={1} fill="url(#colorWaiting)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
