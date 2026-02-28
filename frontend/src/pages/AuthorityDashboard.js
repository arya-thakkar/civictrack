import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AuthorityDashboard.css';

const STATUS_MAP = {
  'Reported': 'badge-reported',
  'Under Review': 'badge-review',
  'In Progress': 'badge-progress',
  'Resolved': 'badge-resolved',
  'Closed': 'badge-closed'
};

const STATUSES = ['Reported', 'Under Review', 'In Progress', 'Resolved', 'Closed'];

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [updating, setUpdating] = useState({});
  const [updateModal, setUpdateModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, reported: 0 });

  useEffect(() => {
    fetchIssues();
    api.get('/issues/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/issues/all', { params: { limit: 100 } });
      setIssues(data.issues || []);
    } catch {}
    setLoading(false);
  };

  const openModal = (issue) => {
    setUpdateModal(issue);
    setNewStatus(issue.status);
    setStatusNote('');
  };

  const handleStatusUpdate = async () => {
    if (!updateModal) return;
    setUpdating(u => ({ ...u, [updateModal._id]: true }));
    try {
      const { data } = await api.put(`/issues/${updateModal._id}/status`, { status: newStatus, note: statusNote });
      setIssues(prev => prev.map(i => i._id === data._id ? data : i));
      setUpdateModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
    setUpdating(u => ({ ...u, [updateModal._id]: false }));
  };

  const filtered = issues.filter(i => {
    if (filters.status && i.status !== filters.status) return false;
    if (filters.category && i.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="authority-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Authority Dashboard</h1>
            <p>Manage and resolve reported civic issues — {user?.city}</p>
          </div>
          <div className="authority-badge-pill">★ {user?.email?.split('@')[1]}</div>
        </div>

        <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 32 }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Reported', value: stats.reported },
            { label: 'In Progress', value: stats.inProgress },
            { label: 'Resolved', value: stats.resolved, accent: true }
          ].map((s, i) => (
            <div key={i} className={`d-stat card ${s.accent ? 'accent' : ''}`}>
              <div className="d-stat-num">{s.value}</div>
              <div className="d-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="filter-row" style={{ marginBottom: 24 }}>
          <select className="form-control filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-control filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">All Categories</option>
            {['Roads & Infrastructure','Water Supply','Electricity','Sanitation & Waste','Public Safety','Parks & Recreation','Traffic','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="authority-table card">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--ink-muted)' }}>No issues found.</td></tr>
                ) : filtered.map(issue => (
                  <tr key={issue._id}>
                    <td>
                      <Link to={`/issues/${issue._id}`} className="issue-link">{issue.title}</Link>
                    </td>
                    <td><span className="cat-tag">{issue.category}</span></td>
                    <td className="location-cell">{issue.address}</td>
                    <td>{issue.reportedBy?.name || '—'}</td>
                    <td><span className={`badge ${STATUS_MAP[issue.status]}`}>{issue.status}</span></td>
                    <td className="date-cell">{new Date(issue.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openModal(issue)} disabled={updating[issue._id]}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {updateModal && (
        <div className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Status</h3>
              <button className="modal-close" onClick={() => setUpdateModal(null)}>✕</button>
            </div>
            <p className="modal-issue-title">{updateModal.title}</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>New Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Note (optional)</label>
              <textarea className="form-control" value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="Add a note for the citizen…" style={{ minHeight: 80 }} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setUpdateModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>Save Status</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
