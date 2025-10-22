import Notification from "../model/notification.model.js";

const toLower = (s) => String(s || "").trim().toLowerCase();
const titleCase = (s) => s ? (s[0].toUpperCase() + s.slice(1).toLowerCase()) : s;

/** POST /api/notifications */
export const createNotification = async (req, res) => {
  try {
    const { title, message, recipientRoles = [] } = req.body;
    if (!title || !message || !recipientRoles.length) {
      return res.status(422).json({ message: "title, message and recipientRoles[] are required" });
    }

    // normalize roles to lowercase for storage
    const rolesLC = recipientRoles.map(toLower);
    const doc = await Notification.create({ title, message, recipientRoles: rolesLC });

    // emit via socket to BOTH lowercase and TitleCase rooms for backward-compat
    const io = req.app.get("io");
    if (io) {
      for (const roleLC of rolesLC) {
        const roleTC = titleCase(roleLC);
        io.to(`role:${roleLC}`).emit("notification:new", doc);
        io.to(`role:${roleTC}`).emit("notification:new", doc);
        // legacy room names
        io.to(roleLC).emit("newNotification", doc);
        io.to(roleTC).emit("newNotification", doc);
      }
    }

    res.status(201).json(doc);
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/notifications/inbox  (JWT required) */
export const getInbox = async (req, res) => {
  try {
    const userId = req.user?.id;
    const roleJWT = toLower(req.user?.role);
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

    if (!userId || !roleJWT) {
      return res.status(422).json({ message: "Missing user or role in token" });
    }

    // Support both stored variants (in case of old docs)
    const roleTC = titleCase(roleJWT);

    const unread = await Notification.find({
      recipientRoles: { $in: [roleJWT, roleTC] },
      readBy: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(unread);
  } catch (err) {
    console.error("Fetch Inbox Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /api/notifications/:id/read */
export const markOneRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId || !id) return res.status(422).json({ message: "Missing user/id" });

    await Notification.updateOne({ _id: id }, { $addToSet: { readBy: userId } });
    res.json({ ok: true });
  } catch (err) {
    console.error("Mark One Read Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /api/notifications/read-all */
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const roleJWT = toLower(req.user?.role);
    if (!userId || !roleJWT) return res.status(422).json({ message: "Missing user/role" });

    let ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      // mark all for this role (support both casings for older docs)
      const roleTC = titleCase(roleJWT);
      const docs = await Notification.find({ recipientRoles: { $in: [roleJWT, roleTC] } }).select("_id");
      ids = docs.map(d => d._id);
    }
    if (!ids.length) return res.json({ ok: true, updated: 0 });

    const r = await Notification.updateMany(
      { _id: { $in: ids } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ ok: true, updated: r.modifiedCount ?? 0 });
  } catch (err) {
    console.error("Mark All Read Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
