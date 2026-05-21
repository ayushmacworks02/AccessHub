import crypto from "crypto";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { env } from "../../config/env.js";
import { RefreshToken } from "./refresh-token.model.js";
import { hashToken } from "../../utils/token-hash.js";

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

const getRefreshTokenExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expiresAt;
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiresIn,
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.accessTokenSecret);
};

export const generateRawRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const createRefreshToken = async ({
  user,
  familyId = nanoid(32),
  createdByIp = "",
  userAgent = "",
}) => {
  const rawRefreshToken = generateRawRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);
  const jti = nanoid(32);

  const refreshTokenRecord = await RefreshToken.create({
    user: user._id,
    tokenHash,
    jti,
    familyId,
    expiresAt: getRefreshTokenExpiryDate(),
    createdByIp,
    userAgent,
  });

  return {
    rawRefreshToken,
    refreshTokenRecord,
  };
};

export const rotateRefreshToken = async ({
  oldRefreshTokenRecord,
  user,
  revokedByIp = "",
  userAgent = "",
}) => {
  const { rawRefreshToken, refreshTokenRecord } = await createRefreshToken({
    user,
    familyId: oldRefreshTokenRecord.familyId,
    createdByIp: revokedByIp,
    userAgent,
  });

  oldRefreshTokenRecord.revokedAt = new Date();
  oldRefreshTokenRecord.revokedByIp = revokedByIp;
  oldRefreshTokenRecord.replacedByToken = refreshTokenRecord.jti;

  await oldRefreshTokenRecord.save();

  return {
    rawRefreshToken,
    refreshTokenRecord,
  };
};

export const revokeRefreshTokenFamily = async ({
  familyId,
  revokedByIp = "",
}) => {
  await RefreshToken.updateMany(
    {
      familyId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
        revokedByIp,
      },
    }
  );
};

export const revokeUserRefreshTokens = async ({ userId, revokedByIp = "" }) => {
  await RefreshToken.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
        revokedByIp,
      },
    }
  );
};

export const findRefreshToken = async (rawRefreshToken) => {
  const tokenHash = hashToken(rawRefreshToken);

  return RefreshToken.findOne({
    tokenHash,
  });
};

export const isRefreshTokenExpired = (refreshTokenRecord) => {
  return refreshTokenRecord.expiresAt.getTime() <= Date.now();
};

export const isRefreshTokenRevoked = (refreshTokenRecord) => {
  return Boolean(refreshTokenRecord.revokedAt);
};