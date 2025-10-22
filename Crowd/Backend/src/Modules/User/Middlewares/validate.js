import jwt from "jsonwebtoken";

// JWT secret key - should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Strict token validation middleware
export const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Best-effort token attachment. Does not fail when token is missing.
export const attachUserIfToken = (req, _res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !JWT_SECRET) return next();

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.warn("attachUserIfToken: invalid token supplied", error.message);
  }
  next();
};

// Role-based authorization middleware
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "Access forbidden" });
    }
  };
};

// Request body validation helper
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};
