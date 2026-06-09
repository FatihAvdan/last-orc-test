import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AnalyticsSnapshot } from '@devfolio/shared';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function StatCard({ label, value, color }: { label: string; value: string; color: string }): React.ReactElement {
  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}

export function AnalyticsPage(): React.ReactElement {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics(): Promise<void> {
      try {
        const response = await fetch('/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const result = await response.json() as AnalyticsSnapshot;
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Analytics Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1>Analytics Dashboard</h1>
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error || 'Failed to load analytics data'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Page Views" value={data.total_page_views.toLocaleString()} color="#3b82f6" />
        <StatCard label="Unique Visitors" value={data.unique_visitors.toLocaleString()} color="#10b981" />
        <StatCard label="Views Today" value={data.views_today.toLocaleString()} color="#f59e0b" />
        <StatCard label="Views This Week" value={data.views_this_week.toLocaleString()} color="#ef4444" />
        <StatCard label="Views This Month" value={data.views_this_month.toLocaleString()} color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Daily Page Views</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily_views}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Top Pages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top_pages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="path" width={150} />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {data.referrers.length > 0 && (
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3>Referrers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.referrers} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={100} label>
                  {data.referrers.map((entry, index) => (
                    <Cell key={`cell-${entry.source}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.countries.length > 0 && (
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3>Visitors by Country</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.countries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
