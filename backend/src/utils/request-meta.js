export const getRequestIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    ""
  );
};

export const getUserAgent = (req) => {
  return req.headers["user-agent"] || "";
};