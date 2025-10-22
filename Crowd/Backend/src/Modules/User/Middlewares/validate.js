// src/Modules/User/Middlewares/validate.js
import jwt from "jsonwebtoken";

/**
 * Set VALIDATE_DEBUG=true in .env if you want to see the logs below.
 */
const DEBUG = String(process.env.VALIDATE_DEBUG || "").toLowerCase() === "true";

/**
 * Validate JWT from Authorization: Bearer <token>
 * Reads JWT_SECRET at request time to avoid issues with late dotenv initialization.
 */
export const validateToken = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const secret = process.env.JWT_SECRET;

  if (DEBUG) {
    console.log(
      "[validateToken]",
      "hasAuthHeader?", !!auth,
      "hasToken?", !!token,
      "hasSecret?", !!secret
    );
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  if (!secret) {
    // If dotenv isn’t loaded yet or env not set
    return res.status(500).json({ message: "Server misconfigured (missing JWT secret)" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (DEBUG) console.log("[validateToken] decoded:", decoded);
    req.user = decoded;
    return next();
  } catch (err) {
    if (DEBUG) console.error("[validateToken] verify error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Role-based gate. Compares case-insensitively.
 */
export const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "User not authenticated" });
  const role = String(req.user.role || "").toLowerCase();
  const ok = allowedRoles.map(r => String(r).toLowerCase()).includes(role);
  if (!ok) return res.status(403).json({ message: "Access forbidden" });
  return next();
};

/**
 * Generic request-body schema validator (Joi/Yup-like)
 */
export const validateRequest = (schema) => (req, res, _next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: (error.details || []).map(d => d.message),
    });
  }
  return _next();
};
