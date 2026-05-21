import mongoose from "mongoose";
import { ApiError } from "../../utils/api-error.js";
import { getRequestIp, getUserAgent } from "../../utils/request-meta.js";
import { Audit } from "./audit.model.js";

import "../users/user.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const normalizeUppercase = (value = "") => {
  return String(value).trim().toUpperCase();
};

export const createAuditLog = async ({
  req = null,
  actor = null,
  module,
  action,
  entityType = "",
  entityId = "",
  description = "",
  status = "success",
  metadata = {},
  errorMessage = "",
}) => {
  try {
    const actorFromRequest = req?.user || null;
    const finalActor = actor || actorFromRequest;

    const audit = await Audit.create({
      actor: finalActor?._id || null,

      actorSnapshot: {
        name: finalActor?.name || "",
        email: finalActor?.email || "",
      },

      module: normalizeUppercase(module),
      action: normalizeUppercase(action),

      entityType,
      entityId: entityId ? entityId.toString() : "",

      description,
      status,

      request: {
        ipAddress: req ? getRequestIp(req) : "",
        userAgent: req ? getUserAgent(req) : "",
        method: req?.method || "",
        path: req?.originalUrl || req?.url || "",
      },

      metadata,
      errorMessage,
    });

    return audit;
  } catch (error) {
    console.error("Audit log creation failed:", error.message);
    return null;
  }
};

export const getAuditsService = async ({
  search = "",
  module = "all",
  action = "all",
  status = "all",
  actor = "all",
  entityType = "all",
  entityId = "all",
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const filter = {};

  if (module !== "all") {
    filter.module = normalizeUppercase(module);
  }

  if (action !== "all") {
    filter.action = normalizeUppercase(action);
  }

  if (status !== "all") {
    filter.status = status;
  }

  if (actor !== "all") {
    filter.actor = toObjectId(actor);
  }

  if (entityType !== "all") {
    filter.entityType = entityType;
  }

  if (entityId !== "all") {
    filter.entityId = entityId;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};

    if (dateFrom) {
      filter.createdAt.$gte = new Date(dateFrom);
    }

    if (dateTo) {
      filter.createdAt.$lte = new Date(dateTo);
    }
  }

  if (search) {
    filter.$or = [
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
      {
        module: {
          $regex: search,
          $options: "i",
        },
      },
      {
        action: {
          $regex: search,
          $options: "i",
        },
      },
      {
        entityType: {
          $regex: search,
          $options: "i",
        },
      },
      {
        entityId: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "actorSnapshot.name": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "actorSnapshot.email": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [audits, total] = await Promise.all([
    Audit.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("actor", "name email status")
      .lean(),

    Audit.countDocuments(filter),
  ]);

  return {
    audits,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getAuditByIdService = async ({ auditId }) => {
  const audit = await Audit.findById(auditId)
    .populate("actor", "name email status")
    .lean();

  if (!audit) {
    throw new ApiError(404, "Audit log not found");
  }

  return audit;
};