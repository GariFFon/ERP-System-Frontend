import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductFormModal from './ProductFormModal';

const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (q) params.set('q', q);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleFormClose = (refreshed?: boolean) => {
    setShowForm(false);
    setEditProduct(null);
    if (refreshed) fetchProducts();
  };

  const isLowStock = (p: Product) => p.currentStock <= p.minStockAlertQty;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Products & Inventory</h2>
          <p className="page-subtitle">{total} total products</p>
        </div>
        {hasRole('Admin', 'Warehouse') && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, SKU, category..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Min Alert</th>
              <th>Warehouse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="loading-center"><div className="spinner" /></div></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} className="table-empty">No products found</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.productName}</div>
                </td>
                <td><code style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{p.sku}</code></td>
                <td>{p.category || '—'}</td>
                <td>₹{Number(p.unitPrice).toLocaleString('en-IN')}</td>
                <td>
                  <span className={isLowStock(p) ? 'stock-low' : 'stock-ok'} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isLowStock(p) && <AlertTriangle size={13} />}
                    {p.currentStock}
                  </span>
                </td>
                <td>{p.minStockAlertQty}</td>
                <td>{p.locationWarehouse || '—'}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => navigate(`/products/${p.id}`)}>
                      <Eye size={14} />
                    </button>
                    {hasRole('Admin', 'Warehouse') && (
                      <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => { setEditProduct(p); setShowForm(true); }}>
                        <Pencil size={14} />
                      </button>
                    )}
                    {hasRole('Admin') && (
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => handleDelete(p.id, p.productName)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span>Showing {products.length} of {total}</span>
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

      {showForm && (
        <ProductFormModal product={editProduct} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default ProductsPage;
