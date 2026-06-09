import React from 'react';
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

const MOCK_DATA: AnalyticsSnapshot = {
  total_page_views: 12845,
  unique_visitors: 3420,
  views_today: 156,
  views_this_week: 1203,
  views_this_month: 4521,
  top_pages: [
    { path: '/p/johndoe', views: 3200 },
    { path: '/p/janedoe', views: 2800 },
    { path: '/blog/getting-started-typescript', views: 1800 },
    { path: '/', views: 1500 },
    { path: '/blog/building-rest-apis-express', views: 1200 },
  ],
  daily_views: [
    { date: '2024-06-01', views: 145 },
    { date: '2024-06-02', views: 132 },
    { date: '2024-06-03', views: 167 },
    { date: '2024-06-04', views: 189 },
    { date: '2024-06-05', views: 156 },
    { date: '2024-06-06', views: 178 },
    { date: '2024-06-07', views: 201 },
    { date: '2024-06-08', views: 134 },
    { date: '2024-06-09', views: 156 },
  ],
  referrers: [
    { source: 'google.com', count: 450 },
    { source: 'github.com', count: 320 },
    { source: 'twitter.com', count: 180 },
    { source: 'linkedin.com', count: 150 },
    { source: 'direct', count: 2100 },
  ],
  countries: [
    { country: 'US', count: 1200 },
    { country: 'GB', count: 450 },
    { country: 'DE', count: 380 },
    { country: 'IN', count: 320 },
    { country: 'CA', count: 280 },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function AnalyticsPage(): React.ReactElement {
  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Page Views" value={MOCK_DATA.total_page_views.toLocaleString()} color="#3b82f6" />
        <StatCard label="Unique Visitors" value={MOCK_DATA.unique_visitors.toLocaleString()} color="#10b981" />
        <StatCard label="Views Today" value={MOCK_DATA.views_today.toLocaleString()} color="#f59e0b" />
        <StatCard label="Views This Week" value={MOCK_DATA.views_this_week.toLocaleString()} color="#ef4444" />
        <StatCard label="Views This Month" value={MOCK_DATA.views_this_month.toLocaleString()} color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="chart-container" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Daily Page Views</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MOCK_DATA.daily_views}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Top Pages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_DATA.top_pages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="path" width={150} />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Referrers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={MOCK_DATA.referrers} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={100} label>
                {MOCK_DATA.referrers.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Visitors by Country</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_DATA.countries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }): React.ReactElement {
  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}
