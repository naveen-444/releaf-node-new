
const jwt = require('jsonwebtoken');
// Middleware to verify JWT token and authenticate the user
module.exports=   authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
   
    if (!token) {
      return res.status(401).json({success:false, message: 'Access denied. No token provided.' });
    }
   
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({success:false, message: 'Invalid token' });
      }
   
      req.user = user; // Attach the decoded user information to the request object
      next(); // Proceed to the next middleware or route handler
    });
  };
