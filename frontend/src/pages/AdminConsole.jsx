import { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import CategoryChip from '../components/CategoryChip.jsx';

const COLORS = ['#2f6fed', '#d97a23', '#7c4fe0', '#2fa86a', '#ef5b50', '#888888'];
const CATEGORIES = ['Product', 'Support', 'Billing', 'Feature Request', 'Bug', 'Other'];
const STATUSES = ['received', 'in_progress', 'resolved'];

export default function AdminConsole({ onLogout }) {
  const [summary, setSummary] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    try {
      const res = await api.analyticsSummary();
      setSummary(res.data);
    } catch (err) {
      if (err.message.includes('401') || /expired|Invalid or expired/i.test(err.message)) {
        sessionStorage.removeItem('acowale_admin_token');
        onLogout?.();
      }
      setError(err.message);
    }
  }, [onLogout]);

  const loadFeedback = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 8 };
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;
        const res = await api.listFeedback(params);
        setFeedback(res.data);
        setPagination(res.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadFeedback(1);
  }, [loadFeedback]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateStatus(id, status);
      loadFeedback(pagination.page);
      loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('acowale_admin_token');
    onLogout?.();
  };

  return (
    <main className="container" style={{ maxWidth: 1080 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Overview</h1>
          <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>Real-time summary of customer feedback.</p>
        </div>
        <button className="btn btn-ghost" onClick={logout}>
          Log out
        </button>
      </div>

      {error && (
        <div style={{ background: '#fdeceb', color: '#b3261e', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Feedback" value={summary ? summary.totalCount : '—'} />
        <StatCard
          label="In Progress"
          value={summary ? summary.statusDistribution.find((s) => s.status === 'in_progress')?.count || 0 : '—'}
          accent="var(--amber)"
        />
        <StatCard
          label="Resolved"
          value={summary ? summary.statusDistribution.find((s) => s.status === 'resolved')?.count || 0 : '—'}
          accent="var(--sage)"
        />
        <StatCard
          label="Avg Rating"
          value={summary?.averageRating != null ? `${summary.averageRating} / 5` : 'N/A'}
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: 20, flex: '1 1 320px' }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Category Distribution</h3>
          {summary?.categoryDistribution?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={summary.categoryDistribution}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {summary.categoryDistribution.map((entry, i) => (
                    <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No data yet.</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {summary?.categoryDistribution?.map((c, i) => (
              <span key={c.category} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                {c.category} ({c.count})
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20, flex: '1 1 320px' }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Feedback Trend (last 7 days)</h3>
          {summary?.trendLast7Days?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={summary.trendLast7Days}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No submissions in the last 7 days.</div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          style={{ maxWidth: 220 }}
          placeholder="Search comments..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="select"
          style={{ maxWidth: 180 }}
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="select"
          style={{ maxWidth: 180 }}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              {['Feedback', 'Category', 'User', 'Date', 'Status'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 16, width: '100%' }} />
                </td>
              </tr>
            )}
            {!loading && feedback.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
                  No feedback matches these filters yet.
                </td>
              </tr>
            )}
            {!loading &&
              feedback.map((f) => (
                <tr key={f._id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', maxWidth: 320 }}>{f.comment}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <CategoryChip category={f.category} />
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-soft)' }}>{f.email || 'Anonymous'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-soft)' }}>
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      className="select"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      value={f.status}
                      onChange={(e) => handleStatusChange(f._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <button
          className="btn btn-ghost"
          disabled={pagination.page <= 1}
          onClick={() => loadFeedback(pagination.page - 1)}
        >
          Previous
        </button>
        <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          className="btn btn-ghost"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => loadFeedback(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}
