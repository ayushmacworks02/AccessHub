import mongoose from "mongoose";
import { STATUS } from "../../constants/status.js";

const permissionSchema = new mongoose.Schema(
  {
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
    },

    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    isSystemPermission: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE],
      default: STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

permissionSchema.index({ module: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model("Permission", permissionSchema);