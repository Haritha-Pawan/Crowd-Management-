// src/Modules/User/Middlewares/validate.js
import jwt from "jsonwebtoken";

/**
 * Set VALIDATE_DEBUG=true in .env if you want debug logs.
 */
const DEBUG = String(process.env.VALIDATE_DEBUG || "").toLowerCase() === "true";

/**
 * Strict token validation middleware (Authorization: Bearer <token>)
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

  if (!token) return res.status(401).json({ message: "No token provided" });
  if (!secret) return res.status(500).json({ message: "Server misconfigured (missing JWT secret)" });

  try {
    const decoded = jwt.verify(token, secret);
    if (DEBUG) console.log("[validateToken] decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    if (DEBUG) console.error("[validateToken] verify error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Best-effort token attachment. Does not fail when token is missing/invalid.
 * Useful for routes that behave differently if a user is known, but don't require auth.
 */
export const attachUserIfToken = (req, _res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return next();

  try {
    req.user = jwt.verify(token, secret);
  } catch (err) {
    if (DEBUG) console.warn("[attachUserIfToken] invalid token:", err.message);
  }
  next();
};

/**
 * Role-based authorization (case-insensitive)
 */
export const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "User not authenticated" });
  const role = String(req.user.role || "").toLowerCase();
  const ok = allowedRoles.map(r => String(r).toLowerCase()).includes(role);
  if (!ok) return res.status(403).json({ message: "Access forbidden" });
  return next();
};

/**
 * Request body validation helper (Joi/Yup-like)
 */
export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: (error.details || []).map(d => d.message),
    });
  }
  next();
};
