const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorityOnly } = require('../middleware/authMiddleware');
const { getStats, createIssue, getAllIssues, getMyIssues, getIssueById, updateStatus } = require('../controllers/issueController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.get('/stats', getStats);
router.get('/all', protect, getAllIssues);
router.get('/my', protect, getMyIssues);
router.get('/:id', protect, getIssueById);
router.post('/', protect, upload.single('image'), createIssue);
router.put('/:id/status', protect, authorityOnly, updateStatus);

module.exports = router;
