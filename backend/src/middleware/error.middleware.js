import { env } from "../config/env.js";

export const errorMiddleware = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;

  const response = {
    success: false,
    message: error.message || "Internal Server Error",
    errors: error.errors || [],
  };

  if (env.isDevelopment) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};