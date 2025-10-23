import jwt from "jsonwebtoken";

// ✅ JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Validate JWT token
export const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Role-based authorization middleware
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

// ✅ Validate request body using a Joi or Yup schema
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
