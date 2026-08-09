import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Product, StockMovement } from '../../types';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return null;

  const isLow = product.currentStock <= product.minStockAlertQty;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/products')}><ArrowLeft size={18} /></button>
          <div>
            <h2 className="page-title">{product.productName}</h2>
            <p className="page-subtitle"><code style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{product.sku}</code></p>
          </div>
        </div>
        {isLow && <span className="badge badge-danger"><AlertTriangle size={12} /> Low Stock</span>}
      </div>

      <div className="card mb-2">
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Product Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><label>Product Name</label><p>{product.productName}</p></div>
          <div className="detail-item"><label>SKU / Code</label><p><code style={{ color: 'var(--accent)' }}>{product.sku}</code></p></div>
          <div className="detail-item"><label>Category</label><p>{product.category || '—'}</p></div>
          <div className="detail-item"><label>Unit Price</label><p style={{ fontWeight: 700 }}>₹{Number(product.unitPrice).toLocaleString('en-IN')}</p></div>
          <div className="detail-item">
            <label>Current Stock</label>
            <p className={isLow ? 'stock-low' : 'stock-ok'} style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isLow && <AlertTriangle size={16} style={{ marginRight: 4 }} />}
              {product.currentStock}
            </p>
          </div>
          <div className="detail-item"><label>Min Stock Alert Qty</label><p>{product.minStockAlertQty}</p></div>
          <div className="detail-item"><label>Location / Warehouse</label><p>{product.locationWarehouse || '—'}</p></div>
          <div className="detail-item"><label>Created By</label><p>{(product.creator as { name?: string })?.name || '—'}</p></div>
          <div className="detail-item"><label>Created At</label><p>{new Date(product.createdAt).toLocaleString()}</p></div>
        </div>
      </div>

      {/* Stock movement log */}
      <div className="table-wrapper">
        <div className="table-toolbar"><strong>Stock Movement Log</strong></div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Qty Changed</th>
              <th>Reason</th>
              <th>Created By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(!product.stockMovements || product.stockMovements.length === 0) ? (
              <tr><td colSpan={5} className="table-empty">No stock movements recorded</td></tr>
            ) : product.stockMovements.map((m: StockMovement) => (
              <tr key={m.id}>
                <td>
                  <span className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {m.movementType === 'IN' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {m.movementType}
                  </span>
                </td>
                <td><strong>{m.movementType === 'IN' ? '+' : '-'}{m.quantityChanged}</strong></td>
                <td>{m.reason}</td>
                <td>{m.creator?.name || '—'}</td>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetailPage;
