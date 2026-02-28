const Issue = require('../models/Issue');

const getStats = async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: 'Resolved' });
    const inProgress = await Issue.countDocuments({ status: 'In Progress' });
    const reported = await Issue.countDocuments({ status: 'Reported' });
    res.json({ total, resolved, inProgress, reported });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createIssue = async (req, res) => {
  try {
    const { title, description, category, address, lat, lng } = req.body;
    if (!title || !description || !category || !address)
      return res.status(400).json({ message: 'Required fields missing' });

    const issue = await Issue.create({
      title, description, category, address,
      city: req.user.city,
      location: { lat: lat || null, lng: lng || null },
      image: req.file ? `/uploads/${req.file.filename}` : '',
      reportedBy: req.user._id,
      statusHistory: [{ status: 'Reported', updatedBy: req.user._id, note: 'Issue reported' }]
    });
    await issue.populate('reportedBy', 'name email');
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const { category, status, city, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (city) filter.city = { $regex: city, $options: 'i' };

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Issue.countDocuments(filter);
    res.json({ issues, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email city')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.updatedBy', 'name email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Reported', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    issue.statusHistory.push({ status, updatedBy: req.user._id, note: note || '' });
    await issue.save();
    await issue.populate('reportedBy', 'name email');
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, createIssue, getAllIssues, getMyIssues, getIssueById, updateStatus };
