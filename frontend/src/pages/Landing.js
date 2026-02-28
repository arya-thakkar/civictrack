import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Landing.css';

const Landing = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, reported: 0 });

  useEffect(() => {
    api.get('/issues/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-tag">Hyperlocal Civic Platform</div>
          <h1 className="hero-title">
            Report. Track.<br />
            <em>Resolve.</em>
          </h1>
          <p className="hero-subtitle">
            A direct line between citizens and local authorities.
            Report civic issues in your neighbourhood and track progress in real time.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">Start Reporting</Link>
            <Link to="/login" className="btn btn-outline">Log In</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid">
            {['Roads & Infrastructure','Water Supply','Electricity','Sanitation & Waste','Public Safety','Parks & Recreation'].map((c, i) => (
              <div key={i} className="visual-chip" style={{ animationDelay: `${i * 0.1}s` }}>{c}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total.toLocaleString()}</div>
              <div className="stat-label">Issues Reported</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-number">{stats.resolved.toLocaleString()}</div>
              <div className="stat-label">Issues Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.inProgress.toLocaleString()}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.reported.toLocaleString()}</div>
              <div className="stat-label">Awaiting Review</div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create an account as a citizen. Government email IDs are automatically verified as authority accounts.' },
              { step: '02', title: 'Report', desc: 'Submit a civic issue with location, photo, and description. Takes less than two minutes.' },
              { step: '03', title: 'Track', desc: 'Authorities review and update status. Follow every step from your dashboard.' }
            ].map((s, i) => (
              <div key={i} className="step-card card">
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <span className="brand-name" style={{fontFamily:'var(--font-serif)'}}>⬡ CivicTrack</span>
          <span className="footer-copy">Making cities work for everyone.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
