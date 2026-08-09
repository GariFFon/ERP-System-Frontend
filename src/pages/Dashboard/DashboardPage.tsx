import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Package, AlertTriangle, FileText } from 'lucide-react';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  recentChallans: Array<{
    id: string;
    challanNumber: string;
    status: string;
    totalQuantity: number;
    createdAt: string;
    customer?: { customerName: string };
  }>;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, productsRes, challansRes, lowStockRes] = await Promise.all([
          api.get('/customers?limit=1'),
          api.get('/products?limit=1'),
          api.get('/challans?limit=5'),
          api.get('/products/low-stock'),
        ]);

        setStats({
          totalCustomers: customersRes.data.pagination?.total || 0,
          totalProducts: productsRes.data.pagination?.total || 0,
          lowStockProducts: Array.isArray(lowStockRes.data.data) ? lowStockRes.data.data.length : 0,
          totalChallans: challansRes.data.pagination?.total || 0,
          recentChallans: challansRes.data.data || [],
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusColor = (s: string) => {
    if (s === 'Confirmed') return 'badge-success';
    if (s === 'Draft') return 'badge-warning';
    if (s === 'Cancelled') return 'badge-danger';
    return 'badge-muted';
  };

  if (loading) return (
    <div className="loading-center"><div className="spinner" /> Loading dashboard...</div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Welcome back — here's what's happening today</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Users size={22} color="var(--accent)" />
          </div>
          <div>
            <div className="stat-value">{stats?.totalCustomers ?? '—'}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Package size={22} color="var(--success)" />
          </div>
          <div>
            <div className="stat-value">{stats?.totalProducts ?? '—'}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={22} color="var(--danger)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: stats?.lowStockProducts ? 'var(--danger)' : 'inherit' }}>
              {stats?.lowStockProducts ?? '—'}
            </div>
            <div className="stat-label">Low Stock Alerts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <FileText size={22} color="var(--warning)" />
          </div>
          <div>
            <div className="stat-value">{stats?.totalChallans ?? '—'}</div>
            <div className="stat-label">Total Challans</div>
          </div>
        </div>
      </div>

      {/* Recent challans */}
      <div className="table-wrapper">
        <div className="table-toolbar">
          <strong style={{ fontSize: '0.95rem' }}>Recent Challans</strong>
        </div>
        <table>
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentChallans?.length === 0 ? (
              <tr><td colSpan={5} className="table-empty">No challans yet</td></tr>
            ) : (
              stats?.recentChallans?.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.challanNumber}</strong></td>
                  <td>{c.customer?.customerName || '—'}</td>
                  <td>{c.totalQuantity}</td>
                  <td><span className={`badge ${statusColor(c.status)}`}>{c.status}</span></td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
