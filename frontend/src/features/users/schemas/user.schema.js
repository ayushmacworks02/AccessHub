import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const createUserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .toLowerCase(),

  password: passwordSchema,

  department: z
    .union([objectIdSchema, z.literal("none")])
    .optional()
    .default("none"),

  roles: z
    .array(objectIdSchema)
    .optional()
    .default([])
    .transform((ids) => Array.from(new Set(ids))),

  status: z.enum(["active", "inactive", "invited"], {
    message: "Status is required",
  }),
});

export const updateUserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .toLowerCase(),

  password: z
    .union([passwordSchema, z.literal("")])
    .optional()
    .default(""),

  department: z
    .union([objectIdSchema, z.literal("none")])
    .optional()
    .default("none"),
});

export const userStatusFormSchema = z.object({
  status: z.enum(["active", "inactive", "invited"], {
    message: "Status is required",
  }),
});

export const userRolesFormSchema = z.object({
  roles: z
    .array(objectIdSchema)
    .optional()
    .default([])
    .transform((ids) => Array.from(new Set(ids))),
});

export const userCreateDefaultValues = {
  name: "",
  email: "",
  password: "",
  department: "none",
  roles: [],
  status: "active",
};

export const userEditDefaultValues = {
  name: "",
  email: "",
  password: "",
  department: "none",
};

export const userStatusDefaultValues = {
  status: "active",
};

export const userRolesDefaultValues = {
  roles: [],
};