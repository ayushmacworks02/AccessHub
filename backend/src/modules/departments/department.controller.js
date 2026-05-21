import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createDepartmentService,
  deleteDepartmentService,
  getDepartmentByIdService,
  getDepartmentsService,
  updateDepartmentService,
} from "./department.service.js";

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await createDepartmentService({
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { department }, "Department created"));
});

export const getDepartments = asyncHandler(async (req, res) => {
  const result = await getDepartmentsService(req.validated.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Departments fetched"));
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await getDepartmentByIdService({
    departmentId: req.validated.params.id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { department }, "Department fetched"));
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await updateDepartmentService({
    departmentId: req.validated.params.id,
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { department }, "Department updated"));
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const result = await deleteDepartmentService({
    departmentId: req.validated.params.id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Department deleted"));
});