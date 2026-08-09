import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Challan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const statusBadge = (s: string) => {
  if (s === 'Confirmed') return 'badge-success';
  if (s === 'Draft') return 'badge-warning';
  if (s === 'Cancelled') return 'badge-danger';
  return 'badge-muted';
};

const ChallansPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (status) params.set('status', status);
      const res = await api.get(`/challans?${params}`);
      setChallans(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchChallans(); }, [fetchChallans]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales Challans</h2>
          <p className="page-subtitle">{total} total challans</p>
        </div>
        {hasRole('Admin', 'Sales') && (
          <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>
            <Plus size={16} /> Create Challan
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer</th>
              <th>Total Qty</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="loading-center"><div className="spinner" /></div></td></tr>
            ) : challans.length === 0 ? (
              <tr><td colSpan={8} className="table-empty">No challans found</td></tr>
            ) : challans.map(c => (
              <tr key={c.id}>
                <td><strong style={{ color: 'var(--accent)' }}>{c.challanNumber}</strong></td>
                <td>{c.customer?.customerName || '—'}</td>
                <td>{c.totalQuantity}</td>
                <td>{c.items?.length || 0} items</td>
                <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                <td>{c.creator?.name || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => navigate(`/challans/${c.id}`)}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span>Showing {challans.length} of {total}</span>
          <div className="pagination-btns">
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="btn btn-secondary btn-sm" style={{ cursor: 'default' }}>{page} / {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallansPage;
