import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const roleCodeSchema = z
  .string()
  .trim()
  .min(2, "Role code must be at least 2 characters")
  .max(50, "Role code cannot exceed 50 characters")
  .regex(
    /^[A-Za-z0-9_]+$/,
    "Role code can contain only letters, numbers, and underscores"
  )
  .transform((value) => value.toUpperCase());

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Role name is required")
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name cannot exceed 100 characters"),

  code: roleCodeSchema,

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),

  department: z
    .union([objectIdSchema, z.literal("none")])
    .optional()
    .default("none"),

  status: z.enum(["active", "inactive"], {
    message: "Status is required",
  }),

  permissions: z
    .array(objectIdSchema)
    .optional()
    .default([])
    .transform((ids) => Array.from(new Set(ids))),
});

export const rolePermissionsSchema = z.object({
  permissions: z
    .array(objectIdSchema)
    .min(1, "Select at least one permission")
    .transform((ids) => Array.from(new Set(ids))),
});

export const roleDefaultValues = {
  name: "",
  code: "",
  description: "",
  department: "none",
  status: "active",
  permissions: [],
};