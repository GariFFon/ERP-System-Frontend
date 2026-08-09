import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerFormModal from './CustomerFormModal';

const statusBadge = (s: string) => {
  if (s === 'Active') return 'badge-success';
  if (s === 'Lead') return 'badge-warning';
  if (s === 'Inactive') return 'badge-muted';
  return 'badge-muted';
};

const typeBadge = (t: string) => {
  if (t === 'Wholesale') return 'badge-accent';
  if (t === 'Retail') return 'badge-info';
  return 'badge-muted';
};

const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (customerType) params.set('customer_type', customerType);

      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, q, status, customerType]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const handleFormClose = (refreshed?: boolean) => {
    setShowForm(false);
    setEditCustomer(null);
    if (refreshed) fetchCustomers();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{total} total customers</p>
        </div>
        {hasRole('Admin', 'Sales') && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="table-wrapper">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, mobile, business..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>

          <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select className="filter-select" value={customerType} onChange={e => { setCustomerType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Business</th>
              <th>Type</th>
              <th>Status</th>
              <th>Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="loading-center"><div className="spinner" /></div></td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">No customers found</td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email || '—'}</div>
                </td>
                <td>{c.mobileNumber}</td>
                <td>{c.businessName || '—'}</td>
                <td><span className={`badge ${typeBadge(c.customerType)}`}>{c.customerType}</span></td>
                <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                <td>
                  {c.followUpDate
                    ? <span style={{ fontSize: '0.8rem' }}>{new Date(c.followUpDate).toLocaleDateString()}</span>
                    : <span className="text-muted">—</span>}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => navigate(`/customers/${c.id}`)}>
                      <Eye size={14} />
                    </button>
                    {hasRole('Admin', 'Sales') && (
                      <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => { setEditCustomer(c); setShowForm(true); }}>
                        <Pencil size={14} />
                      </button>
                    )}
                    {hasRole('Admin') && (
                      <button className="btn btn-ghost btn-icon btn-sm" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(c.id, c.customerName)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <span>Showing {customers.length} of {total}</span>
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
        <CustomerFormModal
          customer={editCustomer}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default CustomersPage;
