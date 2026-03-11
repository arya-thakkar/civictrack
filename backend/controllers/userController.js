const User = require('../models/User');
const Issue = require('../models/Issue');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const issueCount = await Issue.countDocuments({ reportedBy: req.user._id });
    const resolvedCount = await Issue.countDocuments({ reportedBy: req.user._id, status: 'Resolved' });
    res.json({ ...user.toObject(), issueCount, resolvedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile };
