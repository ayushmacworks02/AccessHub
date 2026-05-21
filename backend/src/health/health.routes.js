import express from "express";
import { ApiResponse } from "../utils/api-response.js";

const router = express.Router();

router.get("/", (_req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      "Service is healthy"
    )
  );
});

export default router;