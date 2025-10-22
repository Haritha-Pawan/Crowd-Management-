import { createForUsers, getUnreadForUser, markOneRead, markManyRead } from "../../notifications/notifications/notification.service.js";

const trimValue = (value) =>
  typeof value === "string" ? value.trim() : value ?? null;

const getUser = (req) => {
  const headers = req.headers || {};
  return {
    id:
      req.user?.id ||
      req.user?._id ||
      trimValue(headers["x-user-id"]) ||
      null,
    role: trimValue(
      req.user?.role ||
        headers["x-user-role"] ||
        headers["x-role"] ||
        req.query?.role ||
        req.body?.role
    ),
    name: trimValue(
      req.user?.username ||
        req.user?.name ||
        headers["x-user-name"] ||
        headers["x-name"] ||
        req.query?.name ||
        req.body?.name
    ),
    email: trimValue(
      req.user?.email ||
        headers["x-user-email"] ||
        req.query?.email ||
        req.body?.email
    ),
  };
};

// POST /api/coord-notifications
export const createForCoordinator = async (req, res) => {
  try {
    const { title, message, userIds = [], recipientName } = req.body || {};
    if (!title || !message) return res.status(422).json({ message: "title and message are required" });
    if (!userIds.length && !recipientName)
      return res.status(422).json({ message: "userIds[] or recipientName is required" });

    const io = req.app?.get?.("io") || null;
    const doc = await createForUsers({ title, message, userIds, recipientName, io });
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/coord-notifications/inbox
export const coordInbox = async (req, res) => {
  try {
    const { id, role, name, email } = getUser(req);
    console.log("coordInbox request", { id, role, name, email });
    if (!id && !name) {
      return res.status(422).json({ message: "Missing user identity (id or name)" });
    }

    const docs = await getUnreadForUser({
      userId: id,
      role,
      name,
      email,
      limit: parseInt(req.query.limit || "50", 10),
      includeRoleTargets: false,
    });
    res.json(docs);
  } catch (e) {
    console.error("coordInbox error:", e);
    res.status(500).json({ message: e?.message || "Server error" });
  }
};

// POST /api/coord-notifications/:id/read
export const coordMarkOneRead = async (req, res) => {
  try {
    const { id, name, email } = getUser(req);
    await markOneRead({ notifId: req.params.id, userId: id, name, email });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    const status = e.message?.toLowerCase().includes("resolve user")
      ? 422
      : 500;
    res.status(status).json({ message: e.message || "Server error" });
  }
};

// POST /api/coord-notifications/read-all
export const coordMarkAllRead = async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    const { id, role, name, email } = getUser(req);
    const r = await markManyRead({
      ids,
      userId: id,
      role,
      name,
      includeRoleTargets: false,
      email,
    });
    res.json({ ok: true, updated: r.modifiedCount ?? 0 });
  } catch (e) {
    console.error(e);
    const status = e.message?.toLowerCase().includes("resolve user")
      ? 422
      : 500;
    res.status(status).json({ message: e.message || "Server error" });
  }
};
