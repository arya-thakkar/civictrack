import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(r => setProfile(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Your account information and activity summary.</p>
        </div>

        <div className="profile-layout">
          <div className="profile-card card">
            <div className="profile-avatar">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{profile?.name}</h2>
            <span className={`role-pill ${profile?.role}`}>
              {profile?.role === 'authority' ? '★ Authority' : 'Citizen'}
            </span>
            <div className="profile-info">
              <div className="profile-field">
                <span className="field-label">Email</span>
                <span className="field-value">{profile?.email}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">City</span>
                <span className="field-value">{profile?.city}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Role</span>
                <span className="field-value" style={{ textTransform: 'capitalize' }}>{profile?.role}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Member since</span>
                <span className="field-value">{new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="activity-section">
            {profile?.role === 'citizen' && (
              <div className="activity-stats">
                <div className="a-stat card">
                  <div className="a-stat-num">{profile?.issueCount || 0}</div>
                  <div className="a-stat-label">Issues Reported</div>
                </div>
                <div className="a-stat card accent">
                  <div className="a-stat-num">{profile?.resolvedCount || 0}</div>
                  <div className="a-stat-label">Issues Resolved</div>
                </div>
                <div className="a-stat card">
                  <div className="a-stat-num">
                    {profile?.issueCount > 0 ? Math.round((profile?.resolvedCount / profile?.issueCount) * 100) : 0}%
                  </div>
                  <div className="a-stat-label">Resolution Rate</div>
                </div>
              </div>
            )}
            <div className="account-detail card">
              <h3>Account Details</h3>
              <p>
                {profile?.role === 'authority'
                  ? 'Your government email was automatically detected, granting you authority access to manage and update civic issues.'
                  : 'As a citizen, you can report civic issues and track their progress. Your contributions help improve the city.'}
              </p>
              {profile?.role === 'authority' && (
                <div className="authority-badge">
                  <span>★</span>
                  <span>Verified Government Official — {profile?.email?.split('@')[1]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
