import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Customer, CustomerFollowup } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X, MessageSquare } from 'lucide-react';

const statusBadge = (s: string) => s === 'Active' ? 'badge-success' : s === 'Lead' ? 'badge-warning' : 'badge-muted';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupForm, setFollowupForm] = useState({ note: '', followUpDate: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch {
      toast.error('Customer not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomer(); }, [id]);

  const addFollowup = async () => {
    if (!followupForm.note.trim()) { toast.error('Note is required'); return; }
    if (!followupForm.followUpDate) { toast.error('Follow-up date is required'); return; }

    setSaving(true);
    try {
      await api.post(`/customers/${id}/followups`, followupForm);
      toast.success('Follow-up added');
      setShowFollowupModal(false);
      setFollowupForm({ note: '', followUpDate: '' });
      fetchCustomer();
    } catch {
      toast.error('Failed to add follow-up');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!customer) return null;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/customers')}><ArrowLeft size={18} /></button>
          <div>
            <h2 className="page-title">{customer.customerName}</h2>
            <p className="page-subtitle">{customer.businessName || customer.mobileNumber}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <span className={`badge ${statusBadge(customer.status)}`} style={{ alignSelf: 'center' }}>{customer.status}</span>
          {hasRole('Admin', 'Sales') && (
            <button className="btn btn-primary" onClick={() => setShowFollowupModal(true)}>
              <Plus size={16} /> Add Follow-up
            </button>
          )}
        </div>
      </div>

      {/* Customer details */}
      <div className="card mb-2">
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Customer Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><label>Customer Name</label><p>{customer.customerName}</p></div>
          <div className="detail-item"><label>Mobile Number</label><p>{customer.mobileNumber}</p></div>
          <div className="detail-item"><label>Email</label><p>{customer.email || '—'}</p></div>
          <div className="detail-item"><label>Business Name</label><p>{customer.businessName || '—'}</p></div>
          <div className="detail-item"><label>GST Number</label><p>{customer.gstNumber || 'Not provided'}</p></div>
          <div className="detail-item"><label>Customer Type</label><p>{customer.customerType}</p></div>
          <div className="detail-item"><label>Status</label><p><span className={`badge ${statusBadge(customer.status)}`}>{customer.status}</span></p></div>
          <div className="detail-item"><label>Follow-up Date</label><p>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : '—'}</p></div>
          <div className="detail-item full"><label>Address</label><p>{customer.address}</p></div>
          {customer.notes && <div className="detail-item full"><label>Notes</label><p>{customer.notes}</p></div>}
          <div className="detail-item"><label>Created By</label><p>{(customer.creator as { name?: string })?.name || '—'}</p></div>
          <div className="detail-item"><label>Created At</label><p>{new Date(customer.createdAt).toLocaleString()}</p></div>
        </div>
      </div>

      {/* Follow-ups */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} /> Follow-up History ({customer.followups?.length || 0})
          </h3>
        </div>

        {customer.followups?.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No follow-ups yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {customer.followups?.map((f: CustomerFollowup) => (
              <div key={f.id} style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {f.creator?.name} · {new Date(f.createdAt).toLocaleString()}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    Due: {new Date(f.followUpDate).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem' }}>{f.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up Modal */}
      {showFollowupModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowFollowupModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Add Follow-up Note</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowFollowupModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Follow-up Date <span className="required">*</span></label>
                <input type="date" value={followupForm.followUpDate} onChange={e => setFollowupForm(f => ({ ...f, followUpDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Note <span className="required">*</span></label>
                <textarea placeholder="What was discussed? Any action items?" value={followupForm.note} onChange={e => setFollowupForm(f => ({ ...f, note: e.target.value }))} style={{ minHeight: '100px' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFollowupModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={addFollowup}>
                {saving ? <><span className="spinner" /> Saving...</> : 'Add Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
