const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found"
      });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET;

    if (!jwtSecret) {
      return res.status(503).json({
        message: "Authentication is not configured"
      });
    }

    const decoded = jwt.verify(
      token,
        jwtSecret
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;