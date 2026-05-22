import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const objectIdArraySchema = z
  .array(objectIdSchema)
  .optional()
  .default([])
  .transform((ids) => Array.from(new Set(ids)));

const requiredObjectIdArraySchema = z
  .array(objectIdSchema, {
    required_error: "Ids are required",
  })
  .transform((ids) => Array.from(new Set(ids)));

export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Group name is required",
      })
      .trim()
      .min(2, "Group name must be at least 2 characters")
      .max(100, "Group name cannot exceed 100 characters"),

    code: z
      .string({
        required_error: "Group code is required",
      })
      .trim()
      .min(2, "Group code must be at least 2 characters")
      .max(50, "Group code cannot exceed 50 characters")
      .regex(
        /^[A-Za-z0-9_]+$/,
        "Group code can contain only letters, numbers, and underscores"
      )
      .transform((value) => value.toUpperCase()),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .default(""),

    users: objectIdArraySchema,

    roles: objectIdArraySchema,

    status: z.enum(["active", "inactive"]).optional().default("active"),
  }),

  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateGroupSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Group name must be at least 2 characters")
        .max(100, "Group name cannot exceed 100 characters")
        .optional(),

      code: z
        .string()
        .trim()
        .min(2, "Group code must be at least 2 characters")
        .max(50, "Group code cannot exceed 50 characters")
        .regex(
          /^[A-Za-z0-9_]+$/,
          "Group code can contain only letters, numbers, and underscores"
        )
        .transform((value) => value.toUpperCase())
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

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

export const groupIdSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const assignGroupUsersSchema = z.object({
  body: z.object({
    users: requiredObjectIdArraySchema,
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const assignGroupRolesSchema = z.object({
  body: z.object({
    roles: requiredObjectIdArraySchema,
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const listGroupsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),

  query: z.object({
    search: z.string().trim().optional().default(""),

    status: z.enum(["active", "inactive", "all"]).optional().default("all"),

    user: z
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
      .enum(["name", "code", "status", "createdAt", "updatedAt"])
      .optional()
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});