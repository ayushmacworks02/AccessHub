import crypto from "crypto";

import { env } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import { STATUS } from "../../constants/status.js";
import { User } from "../users/user.model.js";
import { Group } from "../groups/group.model.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { hashToken } from "../../utils/token-hash.js";
import { getRequestIp, getUserAgent } from "../../utils/request-meta.js";
import { PasswordResetToken } from "./password-reset-token.model.js";
import { buildPasswordResetEmail } from "../mail/mail.templates.js";
import { sendPasswordResetEmail } from "../mail/mail.service.js";
import { createAuditLog } from "../audits/audit.service.js";

import "../roles/role.model.js";
import "../permissions/permission.model.js";
import "../departments/department.model.js";

import {
  createRefreshToken,
  findRefreshToken,
  generateAccessToken,
  isRefreshTokenExpired,
  isRefreshTokenRevoked,
  revokeRefreshTokenFamily,
  revokeUserRefreshTokens,
  rotateRefreshToken,
} from "./token.service.js";

const getUserWithRolesAndPermissions = async (userId) => {
  return User.findById(userId)
    .select("-password")
    .populate("department", "name code status")
    .populate({
      path: "roles",
      select: "name code status permissions isSystemRole",
      populate: {
        path: "permissions",
        select: "module action key label status",
      },
    });
};

const getUserActiveGroupsWithRolesAndPermissions = async (userId) => {
  return Group.find({
    users: userId,
    status: STATUS.ACTIVE,
  })
    .select("name code description status roles")
    .populate({
      path: "roles",
      select: "name code status permissions isSystemRole",
      populate: {
        path: "permissions",
        select: "module action key label status",
      },
    })
    .lean();
};

const addRolePermissionsToSet = ({ roles = [], permissionsSet }) => {
  roles.forEach((role) => {
    if (!role || role.status !== STATUS.ACTIVE) {
      return;
    }

    role.permissions?.forEach((permission) => {
      if (permission?.status === STATUS.ACTIVE && permission?.key) {
        permissionsSet.add(permission.key);
      }
    });
  });
};

const extractEffectivePermissions = ({ user, groups = [] }) => {
  if (user?.isSuperAdmin) {
    return ["*"];
  }

  const permissions = new Set();

  addRolePermissionsToSet({
    roles: user?.roles || [],
    permissionsSet: permissions,
  });

  groups.forEach((group) => {
    addRolePermissionsToSet({
      roles: group.roles || [],
      permissionsSet: permissions,
    });
  });

  return Array.from(permissions);
};

const getGroupSummary = (groups = []) => {
  return groups.map((group) => ({
    _id: group._id,
    name: group.name,
    code: group.code,
    status: group.status,
    roles: Array.isArray(group.roles)
      ? group.roles.map((role) => ({
          _id: role._id,
          name: role.name,
          code: role.code,
          status: role.status,
          isSystemRole: role.isSystemRole,
        }))
      : [],
  }));
};

const generatePasswordResetRawToken = () => {
  return crypto.randomBytes(48).toString("hex");
};

const getPasswordResetExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + env.passwordResetTokenExpiresMinutes
  );
  return expiresAt;
};

const buildResetPasswordUrl = (rawToken) => {
  const baseUrl = env.frontendResetPasswordUrl.replace(/\/$/, "");
  return `${baseUrl}/${rawToken}`;
};

export const buildAuthUserResponse = ({ user, groups = [] }) => {
  const plainUser = user.toObject ? user.toObject() : user;

  return {
    _id: plainUser._id,
    name: plainUser.name,
    email: plainUser.email,
    department: plainUser.department,
    roles: plainUser.roles,
    groups: getGroupSummary(groups),
    isSuperAdmin: plainUser.isSuperAdmin,
    status: plainUser.status,
    lastLoginAt: plainUser.lastLoginAt,
    permissions: extractEffectivePermissions({
      user: plainUser,
      groups,
    }),
  };
};

export const loginUser = async ({ email, password, req }) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  })
    .select("+password")
    .populate({
      path: "roles",
      select: "name code status permissions isSystemRole",
      populate: {
        path: "permissions",
        select: "module action key label status",
      },
    })
    .populate("department", "name code status");

  if (!user) {
    await createAuditLog({
      req,
      module: "AUTH",
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: "",
      description: `Login failed for unknown email: ${email}`,
      status: "failed",
      metadata: {
        email,
        reason: "USER_NOT_FOUND",
      },
      errorMessage: "Invalid email or password",
    });

    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== STATUS.ACTIVE) {
    await createAuditLog({
      req,
      actor: user,
      module: "AUTH",
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user._id,
      description: `Login failed because account is not active: ${user.email}`,
      status: "failed",
      metadata: {
        email: user.email,
        status: user.status,
        reason: "ACCOUNT_NOT_ACTIVE",
      },
      errorMessage: "Your account is not active",
    });

    throw new ApiError(403, "Your account is not active");
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    await createAuditLog({
      req,
      actor: user,
      module: "AUTH",
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user._id,
      description: `Login failed due to invalid password: ${user.email}`,
      status: "failed",
      metadata: {
        email: user.email,
        reason: "INVALID_PASSWORD",
      },
      errorMessage: "Invalid email or password",
    });

    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);

  const { rawRefreshToken } = await createRefreshToken({
    user,
    createdByIp: getRequestIp(req),
    userAgent: getUserAgent(req),
  });

  const freshUser = await getUserWithRolesAndPermissions(user._id);
  const groups = freshUser.isSuperAdmin
    ? []
    : await getUserActiveGroupsWithRolesAndPermissions(freshUser._id);

  await createAuditLog({
    req,
    actor: user,
    module: "AUTH",
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user._id,
    description: `User logged in successfully: ${user.email}`,
    status: "success",
    metadata: {
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      groupsCount: groups.length,
    },
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: buildAuthUserResponse({
      user: freshUser,
      groups,
    }),
  };
};

export const refreshUserSession = async ({ rawRefreshToken, req }) => {
  if (!rawRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const refreshTokenRecord = await findRefreshToken(rawRefreshToken);

  if (!refreshTokenRecord) {
    await createAuditLog({
      req,
      module: "AUTH",
      action: "REFRESH_FAILED",
      entityType: "RefreshToken",
      entityId: "",
      description: "Session refresh failed because refresh token was invalid",
      status: "failed",
      metadata: {
        reason: "INVALID_REFRESH_TOKEN",
      },
      errorMessage: "Invalid refresh token",
    });

    throw new ApiError(401, "Invalid refresh token");
  }

  const requestIp = getRequestIp(req);

  if (isRefreshTokenRevoked(refreshTokenRecord)) {
    await revokeRefreshTokenFamily({
      familyId: refreshTokenRecord.familyId,
      revokedByIp: requestIp,
    });

    await createAuditLog({
      req,
      module: "AUTH",
      action: "REFRESH_REUSE_DETECTED",
      entityType: "RefreshToken",
      entityId: refreshTokenRecord._id,
      description: "Refresh token reuse detected and token family revoked",
      status: "failed",
      metadata: {
        userId: refreshTokenRecord.user,
        familyId: refreshTokenRecord.familyId,
      },
      errorMessage: "Refresh token reuse detected",
    });

    throw new ApiError(
      401,
      "Refresh token reuse detected. Please login again."
    );
  }

  if (isRefreshTokenExpired(refreshTokenRecord)) {
    await revokeRefreshTokenFamily({
      familyId: refreshTokenRecord.familyId,
      revokedByIp: requestIp,
    });

    await createAuditLog({
      req,
      module: "AUTH",
      action: "REFRESH_FAILED",
      entityType: "RefreshToken",
      entityId: refreshTokenRecord._id,
      description: "Session refresh failed because refresh token expired",
      status: "failed",
      metadata: {
        userId: refreshTokenRecord.user,
        familyId: refreshTokenRecord.familyId,
        reason: "REFRESH_TOKEN_EXPIRED",
      },
      errorMessage: "Refresh token expired",
    });

    throw new ApiError(401, "Refresh token expired. Please login again.");
  }

  const user = await getUserWithRolesAndPermissions(refreshTokenRecord.user);

  if (!user || user.status !== STATUS.ACTIVE) {
    await revokeRefreshTokenFamily({
      familyId: refreshTokenRecord.familyId,
      revokedByIp: requestIp,
    });

    await createAuditLog({
      req,
      actor: user,
      module: "AUTH",
      action: "REFRESH_FAILED",
      entityType: "User",
      entityId: user?._id || refreshTokenRecord.user,
      description: "Session refresh failed because user is missing or inactive",
      status: "failed",
      metadata: {
        userId: refreshTokenRecord.user,
        familyId: refreshTokenRecord.familyId,
        reason: "USER_MISSING_OR_INACTIVE",
      },
      errorMessage: "User account is not active",
    });

    throw new ApiError(401, "User account is not active");
  }

  const groups = user.isSuperAdmin
    ? []
    : await getUserActiveGroupsWithRolesAndPermissions(user._id);

  const accessToken = generateAccessToken(user);

  const { rawRefreshToken: newRawRefreshToken } = await rotateRefreshToken({
    oldRefreshTokenRecord: refreshTokenRecord,
    user,
    revokedByIp: requestIp,
    userAgent: getUserAgent(req),
  });

  await createAuditLog({
    req,
    actor: user,
    module: "AUTH",
    action: "SESSION_REFRESHED",
    entityType: "User",
    entityId: user._id,
    description: `Session refreshed for user: ${user.email}`,
    status: "success",
    metadata: {
      familyId: refreshTokenRecord.familyId,
      groupsCount: groups.length,
    },
  });

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    user: buildAuthUserResponse({
      user,
      groups,
    }),
  };
};

export const logoutUser = async ({ rawRefreshToken, req }) => {
  if (!rawRefreshToken) {
    return;
  }

  const refreshTokenRecord = await findRefreshToken(rawRefreshToken);

  if (!refreshTokenRecord) {
    return;
  }

  if (!refreshTokenRecord.revokedAt) {
    refreshTokenRecord.revokedAt = new Date();
    refreshTokenRecord.revokedByIp = getRequestIp(req);
    await refreshTokenRecord.save();
  }

  await createAuditLog({
    req,
    module: "AUTH",
    action: "LOGOUT_SUCCESS",
    entityType: "User",
    entityId: req.user?._id || refreshTokenRecord.user,
    description: `User logged out successfully: ${req.user?.email || ""}`,
    status: "success",
    metadata: {
      userId: req.user?._id || refreshTokenRecord.user,
      refreshTokenId: refreshTokenRecord._id,
      familyId: refreshTokenRecord.familyId,
    },
  });
};

export const logoutUserFromAllDevices = async ({ userId, req }) => {
  await revokeUserRefreshTokens({
    userId,
    revokedByIp: getRequestIp(req),
  });

  await createAuditLog({
    req,
    module: "AUTH",
    action: "LOGOUT_ALL_SUCCESS",
    entityType: "User",
    entityId: userId,
    description: `User logged out from all devices: ${req.user?.email || ""}`,
    status: "success",
    metadata: {
      userId,
    },
  });
};

export const getAuthenticatedUser = async (userId) => {
  const user = await getUserWithRolesAndPermissions(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const groups = user.isSuperAdmin
    ? []
    : await getUserActiveGroupsWithRolesAndPermissions(user._id);

  return buildAuthUserResponse({
    user,
    groups,
  });
};

export const forgotPasswordService = async ({ email, req }) => {
  const genericResponse = {
    email,
    previewUrl: null,
  };

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user || user.status !== STATUS.ACTIVE) {
    await createAuditLog({
      req,
      actor: user,
      module: "AUTH",
      action: "PASSWORD_RESET_REQUEST_IGNORED",
      entityType: "User",
      entityId: user?._id || "",
      description: `Password reset request ignored for email: ${email}`,
      status: "success",
      metadata: {
        email,
        reason: !user ? "USER_NOT_FOUND" : "USER_NOT_ACTIVE",
      },
    });

    return genericResponse;
  }

  await PasswordResetToken.updateMany(
    {
      user: user._id,
      usedAt: null,
    },
    {
      $set: {
        usedAt: new Date(),
        usedByIp: getRequestIp(req),
      },
    }
  );

  const rawToken = generatePasswordResetRawToken();
  const tokenHash = hashToken(rawToken);
  const resetUrl = buildResetPasswordUrl(rawToken);

  await PasswordResetToken.create({
    user: user._id,
    tokenHash,
    expiresAt: getPasswordResetExpiryDate(),
    requestedByIp: getRequestIp(req),
    userAgent: getUserAgent(req),
  });

  const emailContent = buildPasswordResetEmail({
    name: user.name,
    resetUrl,
    expiresInMinutes: env.passwordResetTokenExpiresMinutes,
  });

  const mailResult = await sendPasswordResetEmail({
    to: user.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });

  await createAuditLog({
    req,
    actor: user,
    module: "AUTH",
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "User",
    entityId: user._id,
    description: `Password reset requested for user: ${user.email}`,
    status: "success",
    metadata: {
      email: user.email,
      previewUrl: env.isDevelopment ? mailResult.previewUrl || null : null,
    },
  });

  return {
    email,
    previewUrl: mailResult.previewUrl || null,
  };
};

export const resetPasswordService = async ({ rawToken, password, req }) => {
  const tokenHash = hashToken(rawToken);

  const resetTokenRecord = await PasswordResetToken.findOne({
    tokenHash,
  });

  if (!resetTokenRecord) {
    await createAuditLog({
      req,
      module: "AUTH",
      action: "PASSWORD_RESET_FAILED",
      entityType: "PasswordResetToken",
      entityId: "",
      description: "Password reset failed because token was invalid",
      status: "failed",
      metadata: {
        reason: "INVALID_TOKEN",
      },
      errorMessage: "Invalid or expired password reset token",
    });

    throw new ApiError(400, "Invalid or expired password reset token");
  }

  if (resetTokenRecord.usedAt) {
    await createAuditLog({
      req,
      module: "AUTH",
      action: "PASSWORD_RESET_FAILED",
      entityType: "PasswordResetToken",
      entityId: resetTokenRecord._id,
      description: "Password reset failed because token was already used",
      status: "failed",
      metadata: {
        userId: resetTokenRecord.user,
        reason: "TOKEN_ALREADY_USED",
      },
      errorMessage: "Password reset token has already been used",
    });

    throw new ApiError(400, "Password reset token has already been used");
  }

  if (resetTokenRecord.expiresAt.getTime() <= Date.now()) {
    resetTokenRecord.usedAt = new Date();
    resetTokenRecord.usedByIp = getRequestIp(req);
    await resetTokenRecord.save();

    await createAuditLog({
      req,
      module: "AUTH",
      action: "PASSWORD_RESET_FAILED",
      entityType: "PasswordResetToken",
      entityId: resetTokenRecord._id,
      description: "Password reset failed because token expired",
      status: "failed",
      metadata: {
        userId: resetTokenRecord.user,
        reason: "TOKEN_EXPIRED",
      },
      errorMessage: "Password reset token has expired",
    });

    throw new ApiError(400, "Password reset token has expired");
  }

  const user = await User.findById(resetTokenRecord.user).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== STATUS.ACTIVE) {
    await createAuditLog({
      req,
      actor: user,
      module: "AUTH",
      action: "PASSWORD_RESET_FAILED",
      entityType: "User",
      entityId: user._id,
      description: `Password reset failed because account is inactive: ${user.email}`,
      status: "failed",
      metadata: {
        email: user.email,
        status: user.status,
        reason: "USER_NOT_ACTIVE",
      },
      errorMessage: "Your account is not active",
    });

    throw new ApiError(403, "Your account is not active");
  }

  user.password = await hashPassword(password);
  user.passwordChangedAt = new Date();
  await user.save();

  resetTokenRecord.usedAt = new Date();
  resetTokenRecord.usedByIp = getRequestIp(req);
  await resetTokenRecord.save();

  await revokeUserRefreshTokens({
    userId: user._id,
    revokedByIp: getRequestIp(req),
  });

  await createAuditLog({
    req,
    actor: user,
    module: "AUTH",
    action: "PASSWORD_RESET_SUCCESS",
    entityType: "User",
    entityId: user._id,
    description: `Password reset completed successfully for user: ${user.email}`,
    status: "success",
    metadata: {
      email: user.email,
      resetTokenId: resetTokenRecord._id,
    },
  });

  return {
    userId: user._id,
  };
};