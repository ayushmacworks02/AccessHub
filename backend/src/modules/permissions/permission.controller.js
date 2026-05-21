import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getFlatPermissions,
  getGroupedPermissions,
} from "./permission.service.js";

export const listPermissions = asyncHandler(async (req, res) => {
  const grouped = req.query.grouped !== "false";

  const permissions = grouped
    ? await getGroupedPermissions()
    : await getFlatPermissions();

  return res
    .status(200)
    .json(new ApiResponse(200, { permissions }, "Permissions fetched"));
});