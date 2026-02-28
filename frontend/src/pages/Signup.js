import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Auth.css';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const detectRole = (email) => {
    const govDomains = ['gov.in', 'nic.in', 'mcgm.gov.in', 'bmc.gov.in', 'mcd.gov.in'];
    const domain = email.split('@')[1]?.toLowerCase() || '';
    return govDomains.some(d => domain === d || domain.endsWith('.' + d)) ? 'authority' : 'citizen';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.city) {
      return setError('All fields are required.');
    }
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data.user, data.token);
      navigate(data.user.role === 'authority' ? '/authority' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const previewRole = form.email ? detectRole(form.email) : null;

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⬡ CivicTrack</Link>
          <h1>Create account</h1>
          <p>Join thousands of citizens making their city better.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" name="name" placeholder="Your name" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {previewRole && (
              <div className={`role-preview ${previewRole}`}>
                {previewRole === 'authority' ? '★ Government email detected — Authority account' : '◯ Citizen account'}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>City</label>
            <input className="form-control" name="city" placeholder="Mumbai, Delhi, Pune…" value={form.city} onChange={handleChange} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
};

export default Signup;
