export default function StatCard({ label, value, accent, sub }) {
  return (
    <div className="card" style={{ padding: '18px 20px', flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div className="display" style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: accent || 'var(--ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
