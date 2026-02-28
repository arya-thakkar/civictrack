import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import IssueCard from '../components/IssueCard';
import './Dashboard.css';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [tab, setTab] = useState('my');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [my, all] = await Promise.all([
          api.get('/issues/my'),
          api.get('/issues/all')
        ]);
        setMyIssues(my.data);
        setAllIssues(all.data.issues || []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredAll = allIssues.filter(i => {
    if (filters.status && i.status !== filters.status) return false;
    if (filters.category && i.category !== filters.category) return false;
    return true;
  });

  const stats = {
    total: myIssues.length,
    resolved: myIssues.filter(i => i.status === 'Resolved').length,
    active: myIssues.filter(i => ['In Progress', 'Under Review'].includes(i.status)).length
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Good day, {user?.name?.split(' ')[0]}</h1>
            <p>Track your reported issues and explore your community's concerns.</p>
          </div>
          <Link to="/report" className="btn btn-primary">+ Report Issue</Link>
        </div>

        <div className="dashboard-stats">
          <div className="d-stat card">
            <div className="d-stat-num">{stats.total}</div>
            <div className="d-stat-label">My Reports</div>
          </div>
          <div className="d-stat card">
            <div className="d-stat-num">{stats.active}</div>
            <div className="d-stat-label">Active</div>
          </div>
          <div className="d-stat card accent">
            <div className="d-stat-num">{stats.resolved}</div>
            <div className="d-stat-label">Resolved</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Issues ({myIssues.length})</button>
          <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>Community Issues</button>
        </div>

        {tab === 'all' && (
          <div className="filter-row">
            <select className="form-control filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {['Reported','Under Review','In Progress','Resolved','Closed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className="form-control filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {['Roads & Infrastructure','Water Supply','Electricity','Sanitation & Waste','Public Safety','Parks & Recreation','Traffic','Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="issues-grid">
            {(tab === 'my' ? myIssues : filteredAll).length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <h3>{tab === 'my' ? 'No issues reported yet' : 'No issues found'}</h3>
                <p>{tab === 'my' ? 'Start by reporting a civic issue in your area.' : 'Try adjusting filters.'}</p>
                {tab === 'my' && <Link to="/report" className="btn btn-primary" style={{ marginTop: 16 }}>Report an Issue</Link>}
              </div>
            ) : (
              (tab === 'my' ? myIssues : filteredAll).map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
