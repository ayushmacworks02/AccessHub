import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getAuditByIdService, getAuditsService } from "./audit.service.js";

export const getAudits = asyncHandler(async (req, res) => {
  const result = await getAuditsService(req.validated.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Audit logs fetched"));
});

export const getAuditById = asyncHandler(async (req, res) => {
  const audit = await getAuditByIdService({
    auditId: req.validated.params.id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { audit }, "Audit log fetched"));
});