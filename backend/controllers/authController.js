const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const GOV_DOMAINS = [
  'gov.in', 'nic.in', 'mcgm.gov.in', 'bmc.gov.in', 'mcd.gov.in',
  'dda.org.in', 'ndmc.gov.in', 'bbmp.gov.in', 'ghmc.gov.in',
  'pune.gov.in', 'pcmc.gov.in', 'kolkatamycity.com', 'kmcgov.in',
  'chennaicorporation.gov.in', 'amc.gov.in', 'smc.gov.in', 'imc.gov.in'
];

const detectRole = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'citizen';
  return GOV_DOMAINS.some(gov => domain === gov || domain.endsWith('.' + gov)) ? 'authority' : 'citizen';
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const signup = async (req, res) => {
  try {
    const { name, email, password, city } = req.body;
    if (!name || !email || !password || !city)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const role = detectRole(email);
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, city, role });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, city: user.city, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, city: user.city, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { signup, login };
