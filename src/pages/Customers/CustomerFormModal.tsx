import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Customer, CustomerType, CustomerStatus } from '../../types';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface Props {
  customer: Customer | null;
  onClose: (refreshed?: boolean) => void;
}

const EMPTY_FORM = {
  customerName: '',
  mobileNumber: '',
  email: '',
  businessName: '',
  gstNumber: '',       // optional
  customerType: 'Retail' as CustomerType,
  address: '',
  status: 'Lead' as CustomerStatus,
  followUpDate: '',
  notes: '',
};

const CustomerFormModal: React.FC<Props> = ({ customer, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        customerName: customer.customerName,
        mobileNumber: customer.mobileNumber,
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType,
        address: customer.address,
        status: customer.status,
        followUpDate: customer.followUpDate ? customer.followUpDate.slice(0, 10) : '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { toast.error('Customer name is required'); return; }
    if (!form.mobileNumber.trim()) { toast.error('Mobile number is required'); return; }
    if (!form.address.trim()) { toast.error('Address is required'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        gstNumber: form.gstNumber || undefined,    // optional
        email: form.email || undefined,
        businessName: form.businessName || undefined,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes || undefined,
      };

      if (customer) {
        await api.put(`/customers/${customer.id}`, payload);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer created');
      }
      onClose(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save customer';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={() => onClose()}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Customer Name */}
              <div className="form-group">
                <label>Customer Name <span className="required">*</span></label>
                <input type="text" placeholder="Rajesh Traders" value={form.customerName} onChange={e => set('customerName', e.target.value)} required />
              </div>

              {/* Mobile Number */}
              <div className="form-group">
                <label>Mobile Number <span className="required">*</span></label>
                <input type="tel" placeholder="9876543210" value={form.mobileNumber} onChange={e => set('mobileNumber', e.target.value)} required />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="customer@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              {/* Business Name */}
              <div className="form-group">
                <label>Business Name</label>
                <input type="text" placeholder="Rajesh Traders Pvt Ltd" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
              </div>

              {/* GST Number — optional */}
              <div className="form-group">
                <label>GST Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input type="text" placeholder="27AAPFU0939F1ZV" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
              </div>

              {/* Customer Type */}
              <div className="form-group">
                <label>Customer Type <span className="required">*</span></label>
                <select value={form.customerType} onChange={e => set('customerType', e.target.value)}>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status <span className="required">*</span></label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Follow-up Date */}
              <div className="form-group">
                <label>Follow-up Date</label>
                <input type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} />
              </div>

              {/* Address — full width */}
              <div className="form-group full">
                <label>Address <span className="required">*</span></label>
                <textarea placeholder="123 Market Road, Mumbai, Maharashtra 400001" value={form.address} onChange={e => set('address', e.target.value)} required />
              </div>

              {/* Notes */}
              <div className="form-group full">
                <label>Notes</label>
                <textarea placeholder="Any additional notes about this customer..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (customer ? 'Update Customer' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
