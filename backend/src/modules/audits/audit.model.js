import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    actorSnapshot: {
      name: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },
    },

    module: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    entityType: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    entityId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
      index: true,
    },

    request: {
      ipAddress: {
        type: String,
        default: "",
      },

      userAgent: {
        type: String,
        default: "",
      },

      method: {
        type: String,
        default: "",
        uppercase: true,
      },

      path: {
        type: String,
        default: "",
      },
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    errorMessage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

auditSchema.index({ createdAt: -1 });
auditSchema.index({ module: 1, action: 1, createdAt: -1 });
auditSchema.index({ actor: 1, createdAt: -1 });
auditSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const Audit = mongoose.model("Audit", auditSchema);