import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: (refreshed?: boolean) => void;
}

const EMPTY = {
  productName: '',
  sku: '',
  category: '',
  unitPrice: '',
  currentStock: '0',
  minStockAlertQty: '10',
  locationWarehouse: '',
};

const ProductFormModal: React.FC<Props> = ({ product, onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        productName: product.productName,
        sku: product.sku,
        category: product.category || '',
        unitPrice: String(product.unitPrice),
        currentStock: String(product.currentStock),
        minStockAlertQty: String(product.minStockAlertQty),
        locationWarehouse: product.locationWarehouse || '',
      });
    }
  }, [product]);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) { toast.error('Product name is required'); return; }
    if (!form.sku.trim()) { toast.error('SKU is required'); return; }
    if (!form.unitPrice || isNaN(Number(form.unitPrice))) { toast.error('Valid unit price is required'); return; }

    setLoading(true);
    try {
      const payload = {
        productName: form.productName,
        sku: form.sku,
        category: form.category || undefined,
        unitPrice: parseFloat(form.unitPrice),
        currentStock: parseInt(form.currentStock, 10),
        minStockAlertQty: parseInt(form.minStockAlertQty, 10),
        locationWarehouse: form.locationWarehouse || undefined,
      };

      if (product) {
        await api.put(`/products/${product.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      onClose(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save product';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={() => onClose()}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group">
                <label>Product Name <span className="required">*</span></label>
                <input type="text" placeholder="Basmati Rice 25kg" value={form.productName} onChange={e => set('productName', e.target.value)} required />
              </div>

              {/* SKU / Code */}
              <div className="form-group">
                <label>SKU / Code <span className="required">*</span></label>
                <input type="text" placeholder="RICE-BAS-25" value={form.sku} onChange={e => set('sku', e.target.value)} required disabled={!!product} />
                {product && <span className="form-error">SKU cannot be changed after creation</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category</label>
                <input type="text" placeholder="Grains & Cereals" value={form.category} onChange={e => set('category', e.target.value)} />
              </div>

              {/* Unit Price */}
              <div className="form-group">
                <label>Unit Price (₹) <span className="required">*</span></label>
                <input type="number" placeholder="1800" min="0" step="0.01" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} required />
              </div>

              {/* Current Stock */}
              <div className="form-group">
                <label>Current Stock <span className="required">*</span></label>
                <input type="number" placeholder="100" min="0" value={form.currentStock} onChange={e => set('currentStock', e.target.value)} required disabled={!!product} />
                {product && <span className="form-error">Use Inventory module to adjust stock</span>}
              </div>

              {/* Min Stock Alert Qty */}
              <div className="form-group">
                <label>Min Stock Alert Qty <span className="required">*</span></label>
                <input type="number" placeholder="20" min="0" value={form.minStockAlertQty} onChange={e => set('minStockAlertQty', e.target.value)} required />
              </div>

              {/* Location / Warehouse */}
              <div className="form-group full">
                <label>Location / Warehouse</label>
                <input type="text" placeholder="Warehouse A - Row 1" value={form.locationWarehouse} onChange={e => set('locationWarehouse', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
