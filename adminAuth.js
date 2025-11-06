const db = require('../config/database');

const adminAuth = async (req, res, next) => {
  try {
    // In a real application, you would check if the user has admin role
    // For this demo, we'll check if the user email is admin@halcyon.com
    if (req.user.email !== 'my@halcyon2.com') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Server error during admin authentication' });
  }
};

module.exports = adminAuth;