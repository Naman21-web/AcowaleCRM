import { useState } from 'react';
import { api } from '../api/client.js';

const CATEGORIES = ['Product', 'Support', 'Billing', 'Feature Request', 'Bug', 'Other'];

export default function UserWindow() {
  const [form, setForm] = useState({ category: '', comment: '', rating: 0, email: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || form.comment.trim().length < 3) {
      setError('Please choose a category and write at least a few words of feedback.');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      await api.submitFeedback({
        category: form.category,
        comment: form.comment.trim(),
        rating: form.rating || undefined,
        email: form.email.trim() || undefined,
      });
      setStatus('success');
      setForm({ category: '', comment: '', rating: 0, email: '' });
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  if (status === 'success') {
    return (
      <main className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <h2 style={{ marginBottom: 8 }}>Thanks — that helps a lot.</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>
            Your feedback has been logged and our team will review it.
          </p>
          <button className="btn btn-primary" onClick={() => setStatus('idle')}>
            Share more feedback
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>We value your feedback 💬</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 28 }}>
        Help us improve by sharing your experience. It takes less than a minute.
      </p>

      <form className="card" style={{ padding: 28 }} onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Category *</label>
          <select className="select" value={form.category} onChange={update('category')} required>
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">Your feedback *</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="Share your thoughts, suggestions, or issues..."
            value={form.comment}
            onChange={update('comment')}
            maxLength={2000}
            required
          />
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
            {form.comment.length}/2000
          </div>
        </div>

        <div className="field">
          <label className="label">Rating (optional)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setForm((f) => ({ ...f, rating: f.rating === n ? 0 : n }))}
                style={{
                  fontSize: 22,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  opacity: form.rating >= n ? 1 : 0.25,
                }}
                aria-label={`${n} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label">Your email (optional)</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
          />
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
            We'll only use this to follow up if needed.
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fdeceb',
              color: '#b3261e',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={status === 'submitting'} style={{ width: '100%' }}>
          {status === 'submitting' ? 'Submitting…' : 'Submit feedback'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-soft)', marginTop: 14 }}>
          🔒 Your feedback is secure and anonymous unless you choose to share your email.
        </p>
      </form>
    </main>
  );
}
