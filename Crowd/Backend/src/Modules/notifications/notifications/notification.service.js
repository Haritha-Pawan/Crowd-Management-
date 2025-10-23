import Notification from "../../notifications/model/notification.model.js";
import User from "../../User/User.model.js";
import mongoose from "mongoose";

const { Types } = mongoose;

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value;
  const str = String(value).trim();
  if (!Types.ObjectId.isValid(str)) return null;
  return new Types.ObjectId(str);
};

const normalizeUserIds = (ids = []) => {
  const list = Array.isArray(ids) ? ids : [ids];
  const unique = new Set();
  for (const val of list) {
    const oid = toObjectId(val);
    if (oid) unique.add(oid.toString());
  }
  return Array.from(unique);
};

const findUserObjectIdByNameOrEmail = async ({ name, email } = {}) => {
  const query = {};

  if (name) {
    query.name = new RegExp(`^${escapeRegex(name)}$`, "i");
  }

  if (email) {
    query.email = String(email).trim().toLowerCase();
  }

  if (!Object.keys(query).length) return null;

  const user = await User.findOne(query).select("_id").lean();
  return user?._id ? new Types.ObjectId(user._id) : null;
};

const resolveUserObjectId = async ({ userId, name, email } = {}) => {
  const direct = toObjectId(userId);
  if (direct) return direct;

  const byNameOrEmail = await findUserObjectIdByNameOrEmail({
    name: name ? String(name).trim() : "",
    email: email ? String(email).trim() : "",
  });

  return byNameOrEmail;
};

const buildTargetingQuery = ({ userId, role, name, includeRoles = true } = {}) => {
  const or = [];

  const userObjectId = toObjectId(userId);
  if (userObjectId) {
    or.push({ recipientType: "user", recipientUserIds: userObjectId });
  }

  if (name) {
    const trimmed = String(name).trim();
    if (trimmed) {
      or.push({
        recipientType: "user",
        recipientName: new RegExp(`^${escapeRegex(trimmed)}$`, "i"),
      });
    }
  }

  if (role && includeRoles) {
    or.push({ recipientType: "role", recipientRoles: role });
  }

  return or.length ? { $or: or } : null;
};

const emitNotification = (io, doc, { ids = [], roles = [] } = {}) => {
  if (!io || !doc) return;

  for (const id of ids) {
    io.to(`user:${id}`).emit("notification:new", doc);
  }

  for (const role of roles) {
    io.to(`role:${role}`).emit("notification:new", doc);
    io.to(role).emit("newNotification", doc);
  }
};

export async function createForUsers({
  title,
  message,
  userIds = [],
  recipientName,
  io = null,
  roleFallback = "Coordinator",
} = {}) {
  if (!title || !message) {
    throw new Error("title and message are required");
  }

  const normalizedUserIds = normalizeUserIds(userIds);
  const trimmedName =
    typeof recipientName === "string" ? recipientName.trim() : "";

  let resolvedIds = [...normalizedUserIds];

  if (!resolvedIds.length && trimmedName) {
    const match = await User.findOne({
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    }).select("_id");

    if (match?._id) {
      resolvedIds = [match._id.toString()];
    }
  }

  let doc;

  if (resolvedIds.length || trimmedName) {
    doc = await Notification.create({
      title,
      message,
      recipientType: "user",
      recipientUserIds: resolvedIds,
      recipientName: trimmedName || undefined,
    });

    emitNotification(io, doc, { ids: resolvedIds });
    return doc;
  }

  if (!roleFallback) {
    throw new Error("No target users resolved for notification");
  }

  doc = await Notification.create({
    title,
    message,
    recipientType: "role",
    recipientRoles: [roleFallback],
  });

  emitNotification(io, doc, { roles: [roleFallback] });
  return doc;
}

export async function getUnreadForUser({
  userId,
  role,
  name,
  limit = 50,
  includeRoleTargets = false,
  email,
} = {}) {
  const userObjectId = await resolveUserObjectId({ userId, name, email });
  const query = buildTargetingQuery({
    userId: userObjectId,
    role,
    name,
    includeRoles: includeRoleTargets,
  });
  if (!query) return [];

  if (userObjectId) {
    query.readBy = { $ne: userObjectId };
  }

  const cappedLimit = Math.min(Math.max(parseInt(limit, 10) || 0, 1), 200);
  const docs = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(cappedLimit)
    .lean();

  return docs.map((doc) => ({
    ...doc,
    isRead: false,
  }));
}

export async function markOneRead({ notifId, userId, name, email } = {}) {
  const notifObjectId = toObjectId(notifId);
  if (!notifObjectId) {
    throw new Error("notifId is required");
  }

  const userObjectId = await resolveUserObjectId({ userId, name, email });
  if (!userObjectId) {
    throw new Error("Unable to resolve userId for markOneRead");
  }

  return Notification.updateOne(
    { _id: notifObjectId },
    { $addToSet: { readBy: userObjectId } }
  );
}

export async function markManyRead({
  ids = [],
  userId,
  role,
  name,
  includeRoleTargets = false,
  email,
} = {}) {
  const userObjectId = await resolveUserObjectId({ userId, name, email });
  if (!userObjectId) {
    throw new Error("Unable to resolve userId for markManyRead");
  }

  const query =
    buildTargetingQuery({
      userId: userObjectId,
      role,
      name,
      includeRoles: includeRoleTargets,
    }) || {};

  const normalizedNotifIds = normalizeUserIds(ids);
  if (normalizedNotifIds.length) {
    query._id = { $in: normalizedNotifIds.map((id) => new Types.ObjectId(id)) };
  }

  return Notification.updateMany(query, {
    $addToSet: { readBy: userObjectId },
  });
}

/**
 * Target a specific coordinator by userId
 */
export async function notifyCoordinatorByUserId(userId, title, message) {
  if (!userId) return null;
  return createForUsers({ title, message, userIds: [userId] });
}

/**
 * Target a coordinator by their name (case-insensitive).
 * If not found, fallback to broadcast to all Coordinators.
 */
export async function notifyCoordinatorByName(coordinatorName, title, message) {
  const name = String(coordinatorName || "").trim();
  if (!name) return null;

  return createForUsers({
    title,
    message,
    recipientName: name,
  });
}

