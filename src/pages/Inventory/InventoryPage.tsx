import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import { StockMovement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, X } from 'lucide-react';

const InventoryPage: React.FC = () => {
  const { hasRole } = useAuth();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [movementType, setMovementType] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [products, setProducts] = useState<{ id: string; productName: string; sku: string; currentStock: number }[]>([]);
  const [form, setForm] = useState({ productId: '', quantityChanged: '', movementType: 'IN' as 'IN' | 'OUT', reason: '' });
  const [saving, setSaving] = useState(false);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (movementType) params.set('movement_type', movementType);
      const res = await api.get(`/inventory/movements?${params}`);
      setMovements(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  }, [page, movementType]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  const openModal = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data);
    } catch { /* ignore */ }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.productId) { toast.error('Select a product'); return; }
    if (!form.quantityChanged || Number(form.quantityChanged) <= 0) { toast.error('Enter valid quantity'); return; }
    if (!form.reason.trim()) { toast.error('Reason is required'); return; }

    setSaving(true);
    try {
      await api.post('/inventory/movements', {
        productId: form.productId,
        quantityChanged: parseInt(form.quantityChanged, 10),
        movementType: form.movementType,
        reason: form.reason,
      });
      toast.success('Stock movement recorded');
      setShowModal(false);
      setForm({ productId: '', quantityChanged: '', movementType: 'IN', reason: '' });
      fetchMovements();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to record movement';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">Stock movement log — {total} records</p>
        </div>
        {hasRole('Admin', 'Warehouse') && (
          <button className="btn btn-primary" onClick={openModal}>
            <Plus size={16} /> Adjust Stock
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <select className="filter-select" value={movementType} onChange={e => { setMovementType(e.target.value); setPage(1); }}>
            <option value="">All Movements</option>
            <option value="IN">IN only</option>
            <option value="OUT">OUT only</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Qty Changed</th>
              <th>Reason</th>
              <th>Created By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="loading-center"><div className="spinner" /></div></td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">No stock movements</td></tr>
            ) : movements.map(m => (
              <tr key={m.id}>
                <td>
                  <span className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                    {m.movementType === 'IN' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {m.movementType}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{m.product?.productName}</td>
                <td><code style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{m.product?.sku}</code></td>
                <td>
                  <strong style={{ color: m.movementType === 'IN' ? 'var(--success)' : 'var(--danger)' }}>
                    {m.movementType === 'IN' ? '+' : '-'}{m.quantityChanged}
                  </strong>
                </td>
                <td>{m.reason}</td>
                <td>{m.creator?.name || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span>Showing {movements.length} of {total}</span>
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

      {/* Adjust Stock Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Adjust Stock</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {/* Product */}
                <div className="form-group full">
                  <label>Product <span className="required">*</span></label>
                  <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}>
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.productName} ({p.sku}) — Stock: {p.currentStock}</option>
                    ))}
                  </select>
                </div>

                {/* Movement Type: IN or OUT */}
                <div className="form-group">
                  <label>Movement Type <span className="required">*</span></label>
                  <select value={form.movementType} onChange={e => setForm(f => ({ ...f, movementType: e.target.value as 'IN' | 'OUT' }))}>
                    <option value="IN">IN — Add stock</option>
                    <option value="OUT">OUT — Remove stock</option>
                  </select>
                </div>

                {/* Quantity Changed */}
                <div className="form-group">
                  <label>Quantity Changed <span className="required">*</span></label>
                  <input type="number" min="1" placeholder="50" value={form.quantityChanged}
                    onChange={e => setForm(f => ({ ...f, quantityChanged: e.target.value }))} />
                </div>

                {/* Reason */}
                <div className="form-group full">
                  <label>Reason <span className="required">*</span></label>
                  <input type="text" placeholder="Manual adjustment / Purchase received / Damaged goods..."
                    value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
                {saving ? <><span className="spinner" /> Saving...</> : 'Record Movement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
