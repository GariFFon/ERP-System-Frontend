import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface ProductOption { id: string; productName: string; sku: string; unitPrice: number; currentStock: number; }
interface CustomerOption { id: string; customerName: string; mobileNumber: string; }
interface LineItem { productId: string; quantity: number; productName?: string; sku?: string; unitPrice?: number; currentStock?: number; }

const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);
  const [status, setStatus] = useState<'Draft' | 'Confirmed'>('Draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      const [cusRes, proRes] = await Promise.all([
        api.get('/customers?limit=500&status=Active'),
        api.get('/products?limit=500'),
      ]);
      setCustomers(cusRes.data.data);
      setProducts(proRes.data.data);
    };
    fetchOptions();
  }, []);

  const setItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value as string,
          productName: product?.productName,
          sku: product?.sku,
          unitPrice: product?.unitPrice,
          currentStock: product?.currentStock,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1 }]);

  const removeItem = (index: number) => {
    if (items.length === 1) { toast.error('At least one item is required'); return; }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const totalValue = items.reduce((s, i) => s + ((i.unitPrice || 0) * (Number(i.quantity) || 0)), 0);

  const handleSubmit = async () => {
    setError('');
    if (!customerId) { setError('Please select a customer'); return; }
    if (items.some(i => !i.productId)) { setError('Please select a product for each line item'); return; }
    if (items.some(i => !i.quantity || i.quantity < 1)) { setError('Each item must have a valid quantity'); return; }

    setLoading(true);
    try {
      const res = await api.post('/challans', {
        customerId,
        items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) })),
        status,
      });
      toast.success(`Challan ${res.data.data.challanNumber} created!`);
      navigate(`/challans/${res.data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create challan';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/challans')}><ArrowLeft size={18} /></button>
          <div>
            <h2 className="page-title">Create Sales Challan</h2>
            <p className="page-subtitle">Challan number will be auto-generated</p>
          </div>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>{error}</div>
        )}

        {/* Step 1: Select Customer */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Step 1: Select Customer <span className="required">*</span>
          </label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ maxWidth: 400 }}>
            <option value="">-- Select a customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.customerName} ({c.mobileNumber})</option>
            ))}
          </select>
        </div>

        <hr />

        {/* Step 2: Add Products */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <div className="flex justify-between items-center mb-2">
            <label style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
              Step 2: Add Products <span className="required">*</span>
            </label>
            <button className="btn btn-secondary btn-sm" onClick={addItem}>
              <Plus size={14} /> Add Line
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="challan-item-row">
              {/* Product selector */}
              <select
                value={item.productId}
                onChange={e => setItem(index, 'productId', e.target.value)}
              >
                <option value="">-- Select product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.sku}) — Stock: {p.currentStock}
                  </option>
                ))}
              </select>

              {/* Quantity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 100 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>QTY</label>
                <input
                  type="number"
                  min="1"
                  max={item.currentStock || 9999}
                  value={item.quantity}
                  onChange={e => setItem(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                />
              </div>

              {/* Unit price (read-only snapshot) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 120 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UNIT PRICE</label>
                <input
                  type="text"
                  readOnly
                  value={item.unitPrice ? `₹${Number(item.unitPrice).toLocaleString('en-IN')}` : '—'}
                  style={{ background: 'var(--bg-primary)', cursor: 'default' }}
                />
              </div>

              {/* Subtotal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 120 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SUBTOTAL</label>
                <div style={{ padding: '0.6rem 0.875rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {item.unitPrice ? `₹${(item.unitPrice * Number(item.quantity)).toLocaleString('en-IN')}` : '—'}
                </div>
              </div>

              <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeItem(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Totals */}
          <div className="challan-total-bar">
            <span>Total Quantity: <strong>{totalQty}</strong></span>
            <span>Total Value: <strong>₹{totalValue.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        <hr />

        {/* Step 3: Status */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>
            Step 3: Save As
          </label>
          <div className="flex gap-2">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1.25rem', background: status === 'Draft' ? 'var(--warning-light)' : 'var(--bg-secondary)', border: `1px solid ${status === 'Draft' ? 'var(--warning)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)' }}>
              <input type="radio" value="Draft" checked={status === 'Draft'} onChange={() => setStatus('Draft')} />
              <div>
                <div style={{ fontWeight: 600 }}>Draft</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Save for later. Stock not deducted.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1.25rem', background: status === 'Confirmed' ? 'var(--success-light)' : 'var(--bg-secondary)', border: `1px solid ${status === 'Confirmed' ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)' }}>
              <input type="radio" value="Confirmed" checked={status === 'Confirmed'} onChange={() => setStatus('Confirmed')} />
              <div>
                <div style={{ fontWeight: 600 }}>Confirmed</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Finalize challan. Stock will be deducted.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/challans')}>Cancel</button>
          <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
            {loading ? <><span className="spinner" /> Creating...</> : `Create ${status} Challan`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChallanPage;
