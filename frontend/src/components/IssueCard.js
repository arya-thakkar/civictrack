import React from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';

const STATUS_MAP = {
  'Reported': 'badge-reported',
  'Under Review': 'badge-review',
  'In Progress': 'badge-progress',
  'Resolved': 'badge-resolved',
  'Closed': 'badge-closed'
};

const IssueCard = ({ issue }) => {
  const date = new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Link to={`/issues/${issue._id}`} className="issue-card card">
      {issue.image && (
        <div className="issue-card-img">
          <img src={issue.image} alt={issue.title} />
        </div>
      )}
      <div className="issue-card-body">
        <div className="issue-card-meta">
          <span className={`badge ${STATUS_MAP[issue.status] || 'badge-closed'}`}>{issue.status}</span>
          <span className="issue-category">{issue.category}</span>
        </div>
        <h3 className="issue-card-title">{issue.title}</h3>
        <p className="issue-card-desc">{issue.description}</p>
        <div className="issue-card-footer">
          <span className="issue-location">📍 {issue.address}</span>
          <span className="issue-date">{date}</span>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;
