import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './IssueDetail.css';

const STATUS_MAP = {
  'Reported': 'badge-reported',
  'Under Review': 'badge-review',
  'In Progress': 'badge-progress',
  'Resolved': 'badge-resolved',
  'Closed': 'badge-closed'
};

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/issues/${id}`)
      .then(r => setIssue(r.data))
      .catch(() => setError('Issue not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (error) return <div className="container"><div className="alert alert-error" style={{ marginTop: 40 }}>{error}</div></div>;

  const date = new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="issue-detail-page">
      <div className="container">
        <button className="back-btn btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>

        <div className="issue-detail-layout">
          <div className="issue-main">
            {issue.image && (
              <div className="detail-image card">
                <img src={issue.image} alt={issue.title} />
              </div>
            )}

            <div className="detail-content card">
              <div className="detail-meta">
                <span className={`badge ${STATUS_MAP[issue.status] || 'badge-closed'}`}>{issue.status}</span>
                <span className="issue-category">{issue.category}</span>
              </div>
              <h1 className="detail-title">{issue.title}</h1>
              <p className="detail-desc">{issue.description}</p>

              <div className="detail-info-grid">
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">📍 {issue.address}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">City</span>
                  <span className="info-value">{issue.city}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Reported by</span>
                  <span className="info-value">{issue.reportedBy?.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Reported on</span>
                  <span className="info-value">{date}</span>
                </div>
                {issue.location?.lat && (
                  <div className="info-item">
                    <span className="info-label">Coordinates</span>
                    <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {issue.location.lat.toFixed(5)}, {issue.location.lng.toFixed(5)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="issue-sidebar">
            <div className="timeline-card card">
              <h3>Status Timeline</h3>
              <div className="timeline">
                {(issue.statusHistory || []).map((h, i) => (
                  <div key={i} className={`timeline-item ${i === issue.statusHistory.length - 1 ? 'current' : ''}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <span className={`badge ${STATUS_MAP[h.status] || 'badge-closed'}`}>{h.status}</span>
                      {h.note && <p className="timeline-note">{h.note}</p>}
                      <span className="timeline-date">{new Date(h.updatedAt).toLocaleDateString('en-IN')}</span>
                      {h.updatedBy?.name && <span className="timeline-by">by {h.updatedBy.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
