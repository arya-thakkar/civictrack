import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './ReportIssue.css';

const CATEGORIES = ['Roads & Infrastructure','Water Supply','Electricity','Sanitation & Waste','Public Safety','Parks & Recreation','Traffic','Other'];

const ReportIssue = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', address: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported.');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => { setError('Could not get location.'); setLocLoading(false); }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.category || !form.address)
      return setError('Please fill in all required fields.');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (coords.lat) { data.append('lat', coords.lat); data.append('lng', coords.lng); }
      if (image) data.append('image', image);
      const res = await api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/issues/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="container">
        <div className="page-header">
          <h1>Report an Issue</h1>
          <p>Help improve your community by reporting civic problems.</p>
        </div>

        <div className="report-layout">
          <form className="report-form card" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Issue Title *</label>
              <input className="form-control" name="title" placeholder="Brief, descriptive title" value={form.title} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-control" name="description" placeholder="Describe the issue in detail — what is it, how severe, since when?" value={form.description} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Address / Landmark *</label>
              <input className="form-control" name="address" placeholder="e.g. Near Juhu Beach Gate, Andheri West" value={form.address} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>GPS Location</label>
              <div className="location-row">
                <button type="button" className="btn btn-outline btn-sm" onClick={getLocation} disabled={locLoading}>
                  {locLoading ? 'Detecting…' : '📍 Detect My Location'}
                </button>
                {coords.lat && <span className="coords-text">✓ {parseFloat(coords.lat).toFixed(4)}, {parseFloat(coords.lng).toFixed(4)}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Photo (optional)</label>
              <div className="image-upload-area" onClick={() => document.getElementById('img-input').click()}>
                {preview ? (
                  <img src={preview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Click to upload a photo</span>
                    <span className="upload-hint">Max 5MB</span>
                  </div>
                )}
              </div>
              <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>

          <div className="report-tips">
            <div className="tips-card card">
              <h3>Tips for a good report</h3>
              <ul>
                <li>Use a clear, specific title</li>
                <li>Include exact location or landmark</li>
                <li>Attach a photo for faster resolution</li>
                <li>Describe urgency if it's a safety hazard</li>
              </ul>
            </div>
            <div className="tips-card card">
              <h3>What happens next?</h3>
              <p>Your issue will be reviewed by local authorities within 2–3 working days. You'll be able to track progress from your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
