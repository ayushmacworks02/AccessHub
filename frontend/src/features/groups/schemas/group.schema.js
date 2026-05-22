import { z } from "zod";

export const groupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Group name must be at least 2 characters")
    .max(100, "Group name cannot exceed 100 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Group code must be at least 2 characters")
    .max(50, "Group code cannot exceed 50 characters")
    .regex(
      /^[A-Za-z0-9_]+$/,
      "Group code can contain only letters, numbers, and underscores"
    ),

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

export const groupUsersFormSchema = z.object({
  users: z.array(z.string()).default([]),
});

export const groupRolesFormSchema = z.object({
  roles: z.array(z.string()).default([]),
});