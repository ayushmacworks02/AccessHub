import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const optionalObjectIdOrAllSchema = z
  .union([objectIdSchema, z.literal("all")])
  .optional()
  .default("all");

const optionalDateStringSchema = z
  .string()
  .trim()
  .datetime("Invalid date format. Use ISO date format")
  .optional();

export const auditIdSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}).optional(),
});

export const listAuditsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),

  query: z.object({
    search: z.string().trim().optional().default(""),

    module: z.string().trim().optional().default("all"),

    action: z.string().trim().optional().default("all"),

    status: z
      .enum(["success", "failed", "all"])
      .optional()
      .default("all"),

    actor: optionalObjectIdOrAllSchema,

    entityType: z.string().trim().optional().default("all"),

    entityId: z.string().trim().optional().default("all"),

    dateFrom: optionalDateStringSchema,

    dateTo: optionalDateStringSchema,

    page: z
      .string()
      .optional()
      .default("1")
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1)),

    limit: z
      .string()
      .optional()
      .default("20")
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(100)),

    sortBy: z
      .enum(["createdAt", "module", "action", "status"])
      .optional()
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});