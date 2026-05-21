import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const permissionIdsSchema = z
  .array(objectIdSchema)
  .optional()
  .default([])
  .transform((ids) => Array.from(new Set(ids)));

const requiredPermissionIdsSchema = z
  .array(objectIdSchema, {
    required_error: "Permissions are required",
  })
  .min(1, "At least one permission is required")
  .transform((ids) => Array.from(new Set(ids)));

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Role name is required",
      })
      .trim()
      .min(2, "Role name must be at least 2 characters")
      .max(100, "Role name cannot exceed 100 characters"),

    code: z
      .string({
        required_error: "Role code is required",
      })
      .trim()
      .min(2, "Role code must be at least 2 characters")
      .max(50, "Role code cannot exceed 50 characters")
      .regex(
        /^[A-Za-z0-9_]+$/,
        "Role code can contain only letters, numbers, and underscores"
      )
      .transform((value) => value.toUpperCase()),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .default(""),

    department: objectIdSchema.nullable().optional().default(null),

    permissions: permissionIdsSchema,

    status: z.enum(["active", "inactive"]).optional().default("active"),
  }),

  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateRoleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Role name must be at least 2 characters")
        .max(100, "Role name cannot exceed 100 characters")
        .optional(),

      code: z
        .string()
        .trim()
        .min(2, "Role code must be at least 2 characters")
        .max(50, "Role code cannot exceed 50 characters")
        .regex(
          /^[A-Za-z0-9_]+$/,
          "Role code can contain only letters, numbers, and underscores"
        )
        .transform((value) => value.toUpperCase())
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

      department: objectIdSchema.nullable().optional(),

      status: z.enum(["active", "inactive"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const roleIdSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const assignRolePermissionsSchema = z.object({
  body: z.object({
    permissions: z
      .array(objectIdSchema, {
        required_error: "Permissions are required",
      })
      .transform((ids) => Array.from(new Set(ids))),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const appendRolePermissionsSchema = z.object({
  body: z.object({
    permissions: requiredPermissionIdsSchema,
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const removeRolePermissionsSchema = z.object({
  body: z.object({
    permissions: requiredPermissionIdsSchema,
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const listRolesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),

  query: z.object({
    search: z.string().trim().optional().default(""),

    status: z.enum(["active", "inactive", "all"]).optional().default("all"),

    department: z
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
      .enum(["name", "code", "status", "createdAt", "updatedAt"])
      .optional()
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});