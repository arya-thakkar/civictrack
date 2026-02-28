const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Roads & Infrastructure', 'Water Supply', 'Electricity', 'Sanitation & Waste', 'Public Safety', 'Parks & Recreation', 'Traffic', 'Other']
  },
  status: {
    type: String,
    enum: ['Reported', 'Under Review', 'In Progress', 'Resolved', 'Closed'],
    default: 'Reported'
  },
  image: { type: String, default: '' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
