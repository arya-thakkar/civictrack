const express = require("express");
const router = express.Router();
const { protect, authorityOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  getStats,
  createIssue,
  getAllIssues,
  getMyIssues,
  getIssueById,
  updateStatus,
} = require("../controllers/issueController");

router.get("/stats", getStats);
router.get("/all", protect, getAllIssues);
router.get("/my", protect, getMyIssues);
router.get("/:id", protect, getIssueById);
router.post("/", protect, upload.single("image"), createIssue);
router.put("/:id/status", protect, authorityOnly, updateStatus);

module.exports = router;
