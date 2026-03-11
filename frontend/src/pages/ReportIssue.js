import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './ReportIssue.css';

const CATEGORIES = [
  'Roads & Infrastructure', 'Water Supply', 'Electricity',
  'Sanitation & Waste', 'Public Safety', 'Parks & Recreation', 'Traffic', 'Other'
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', address: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Image must be less than 5MB');
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type))
      return setError('Only JPG, PNG and WebP images allowed');
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    document.getElementById('img-input').value = '';
  };

  const getLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported.');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocLoading(false); },
      () => { setError('Could not get location.'); setLocLoading(false); },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.category) return setError('Category is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.address.trim()) return setError('Address is required');
    setLoading(true);
    setUploadProgress(0);
    try {
      const data = new FormData();
      data.append('title', form.title.trim());
      data.append('description', form.description.trim());
      data.append('category', form.category);
      data.append('address', form.address.trim());
      if (coords.lat) { data.append('lat', coords.lat); data.append('lng', coords.lng); }
      if (image) data.append('image', image);
      const res = await api.post('/issues', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        timeout: 60000
      });
      navigate(`/issues/${res.data._id}`);
    } catch (err) {
      if (err.code === 'ECONNABORTED') setError('Upload timed out. Try a smaller image.');
      else if (err.response?.status === 413) setError('Image too large. Use an image under 5MB.');
      else setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
              <input className="form-control" name="title" placeholder="Brief, descriptive title" value={form.title} onChange={handleChange} maxLength={100} />
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
              <textarea className="form-control" name="description" placeholder="Describe the issue in detail" value={form.description} onChange={handleChange} maxLength={1000} />
              <span className="char-count">{form.description.length}/1000</span>
            </div>
            <div className="form-group">
              <label>Address / Landmark *</label>
              <input className="form-control" name="address" placeholder="e.g. Near Juhu Beach Gate, Andheri West" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>GPS Location (optional)</label>
              <div className="location-row">
                <button type="button" className="btn btn-outline btn-sm" onClick={getLocation} disabled={locLoading}>
                  {locLoading ? 'Detecting…' : '📍 Detect My Location'}
                </button>
                {coords.lat && <span className="coords-text">✓ {parseFloat(coords.lat).toFixed(4)}, {parseFloat(coords.lng).toFixed(4)}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Photo (optional)</label>
              <div className="image-upload-area" onClick={() => !preview && document.getElementById('img-input').click()} style={{ cursor: preview ? 'default' : 'pointer' }}>
                {preview ? (
                  <div className="preview-wrapper">
                    <img src={preview} alt="Preview" className="image-preview" />
                    <button type="button" className="remove-image" onClick={removeImage}>✕ Remove</button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Click to upload a photo</span>
                    <span className="upload-hint">JPG, PNG, WebP — Max 5MB</span>
                  </div>
                )}
              </div>
              <input id="img-input" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImage} style={{ display: 'none' }} />
            </div>
            {loading && uploadProgress > 0 && (
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                <span>{uploadProgress}% uploaded</span>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (image ? 'Uploading…' : 'Submitting…') : 'Submit Report'}
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
              <p>Your issue will be reviewed by local authorities within 2–3 working days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
