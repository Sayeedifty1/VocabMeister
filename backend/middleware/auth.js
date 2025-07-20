const authMiddleware = (req, res, next) => {
  const userId = req.body.userId || req.query.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required - userId missing' });
  }
  
  req.userId = userId;
  next();
};

module.exports = authMiddleware; 