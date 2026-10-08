'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['var(--color-primary-600)', 'var(--color-primary-400)', 'var(--color-primary-200)', 'var(--color-primary-800)'];

export default function StreamDistribution({ data }) {
  if (!data || data.length === 0) {
    return <div className="card text-center text-muted flex items-center justify-center" style={{ minHeight: '300px' }}>No stream data available</div>;
  }

  return (
    <div className="card w-full" style={{ minHeight: '350px' }}>
      <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Stream Distribution</h3>
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              nameKey="stream"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
              itemStyle={{ fontSize: '14px', color: 'var(--color-text-primary)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
