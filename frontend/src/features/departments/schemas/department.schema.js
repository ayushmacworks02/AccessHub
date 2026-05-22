import { z } from "zod";

const departmentCodeSchema = z
  .string()
  .trim()
  .min(2, "Department code must be at least 2 characters")
  .max(30, "Department code cannot exceed 30 characters")
  .regex(
    /^[A-Za-z0-9_]+$/,
    "Department code can contain only letters, numbers, and underscores"
  )
  .transform((value) => value.toUpperCase());

export const departmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required")
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name cannot exceed 100 characters"),

  code: departmentCodeSchema,

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),

  status: z.enum(["active", "inactive"], {
    message: "Status is required",
  }),
});

export const departmentDefaultValues = {
  name: "",
  code: "",
  description: "",
  status: "active",
};