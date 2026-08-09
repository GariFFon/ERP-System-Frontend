import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Challan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const statusBadge = (s: string) => {
  if (s === 'Confirmed') return 'badge-success';
  if (s === 'Draft') return 'badge-warning';
  return 'badge-danger';
};

const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchChallan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data.data);
    } catch {
      toast.error('Challan not found');
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallan(); }, [id]);

  const confirmChallan = async () => {
    if (!confirm('Confirm this challan? Stock will be permanently deducted.')) return;
    setActing(true);
    try {
      await api.patch(`/challans/${id}/confirm`);
      toast.success('Challan confirmed — stock deducted');
      fetchChallan();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to confirm';
      toast.error(msg);
    } finally {
      setActing(false);
    }
  };

  const cancelChallan = async () => {
    if (!confirm('Cancel this challan?')) return;
    setActing(true);
    try {
      await api.patch(`/challans/${id}/cancel`);
      toast.success('Challan cancelled');
      fetchChallan();
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!challan) return null;

  const totalValue = challan.items?.reduce((s, i) => s + (Number(i.unitPriceSnapshot) * i.quantity), 0) || 0;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/challans')}><ArrowLeft size={18} /></button>
          <div>
            <h2 className="page-title" style={{ color: 'var(--accent)' }}>{challan.challanNumber}</h2>
            <p className="page-subtitle">Sales Challan</p>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <span className={`badge ${statusBadge(challan.status)}`}>{challan.status}</span>
          {hasRole('Admin', 'Sales') && challan.status === 'Draft' && (
            <>
              <button className="btn btn-success btn-sm" disabled={acting} onClick={confirmChallan}>
                <CheckCircle size={14} /> Confirm
              </button>
              <button className="btn btn-danger btn-sm" disabled={acting} onClick={cancelChallan}>
                <XCircle size={14} /> Cancel
              </button>
            </>
          )}
          {hasRole('Admin', 'Sales') && challan.status === 'Confirmed' && (
            <button className="btn btn-danger btn-sm" disabled={acting} onClick={cancelChallan}>
              <XCircle size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Challan info */}
      <div className="card mb-2">
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Challan Details</h3>
        <div className="detail-grid">
          {/* All 7 PDF challan fields */}
          <div className="detail-item"><label>Challan Number</label><p style={{ color: 'var(--accent)', fontWeight: 700 }}>{challan.challanNumber}</p></div>
          <div className="detail-item"><label>Customer</label><p>{challan.customer?.customerName}</p></div>
          <div className="detail-item"><label>Total Quantity</label><p style={{ fontWeight: 700 }}>{challan.totalQuantity}</p></div>
          <div className="detail-item"><label>Status</label><p><span className={`badge ${statusBadge(challan.status)}`}>{challan.status}</span></p></div>
          <div className="detail-item"><label>Created By</label><p>{challan.creator?.name || '—'}</p></div>
          <div className="detail-item"><label>Created Date</label><p>{new Date(challan.createdAt).toLocaleString()}</p></div>
        </div>
      </div>

      {/* Products (line items) */}
      <div className="table-wrapper">
        <div className="table-toolbar">
          <strong>Products</strong>
          <span className="badge badge-muted">{challan.items?.length} items</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product (Snapshot)</th>
              <th>SKU (Snapshot)</th>
              <th>Unit Price (Snapshot)</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {challan.items?.map((item, i) => (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{item.productNameSnapshot}</td>
                <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{item.skuSnapshot}</code></td>
                <td>₹{Number(item.unitPriceSnapshot).toLocaleString('en-IN')}</td>
                <td><strong>{item.quantity}</strong></td>
                <td style={{ fontWeight: 700 }}>₹{(Number(item.unitPriceSnapshot) * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <td colSpan={4}></td>
              <td style={{ fontWeight: 700 }}>Total: {challan.totalQuantity}</td>
              <td style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{totalValue.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {challan.status === 'Draft' && (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          ⚠️ This is a draft. Stock has NOT been deducted yet. Click Confirm to finalize.
        </div>
      )}
      {challan.status === 'Confirmed' && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          ✅ This challan is confirmed. Stock has been deducted automatically.
        </div>
      )}
    </div>
  );
};

export default ChallanDetailPage;
