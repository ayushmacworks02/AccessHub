import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const roleIdsSchema = z
  .array(objectIdSchema)
  .optional()
  .default([])
  .transform((ids) => Array.from(new Set(ids)));

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

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: passwordSchema,

    department: objectIdSchema.nullable().optional().default(null),

    roles: roleIdsSchema,

    status: z.enum(["active", "inactive", "invited"]).optional().default("active"),
  }),

  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),

      email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase()
        .optional(),

      password: passwordSchema.optional(),

      department: objectIdSchema.nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "inactive", "invited"], {
      required_error: "Status is required",
    }),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const assignUserRolesSchema = z.object({
  body: z.object({
    roles: z
      .array(objectIdSchema, {
        required_error: "Roles are required",
      })
      .transform((ids) => Array.from(new Set(ids))),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const userIdSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const sendUserPasswordResetSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const listUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),

  query: z.object({
    search: z.string().trim().optional().default(""),

    status: z
      .enum(["active", "inactive", "invited", "all"])
      .optional()
      .default("all"),

    department: z
      .union([objectIdSchema, z.literal("all")])
      .optional()
      .default("all"),

    role: z
      .union([objectIdSchema, z.literal("all")])
      .optional()
      .default("all"),

    page: z
      .string()
      .optional()
      .default("1")
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1)),

    limit: z
      .string()
      .optional()
      .default("10")
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(100)),

    sortBy: z
      .enum(["name", "email", "status", "createdAt", "updatedAt", "lastLoginAt"])
      .optional()
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});