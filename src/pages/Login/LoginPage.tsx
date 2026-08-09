import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setForm({ email, password });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <div>
            <h1>ERP Portal</h1>
            <p>Wholesale & Distribution System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email Address <span className="required">*</span></label>
            <input
              id="email"
              type="email"
              placeholder="admin@erp.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password">Password <span className="required">*</span></label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Logging in...</> : 'Sign In'}
          </button>
        </form>

        <hr />

        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick login (demo)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: '👑 Admin', email: 'admin@erp.com', pw: 'admin123' },
              { label: '💼 Sales', email: 'sales@erp.com', pw: 'sales123' },
              { label: '📦 Warehouse', email: 'warehouse@erp.com', pw: 'warehouse123' },
              { label: '💰 Accounts', email: 'accounts@erp.com', pw: 'accounts123' },
            ].map(r => (
              <button
                key={r.email}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', fontSize: '0.75rem' }}
                onClick={() => quickLogin(r.email, r.pw)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
