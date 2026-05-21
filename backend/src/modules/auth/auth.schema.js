import { z } from "zod";

const resetTokenSchema = z
  .string({
    required_error: "Reset token is required",
  })
  .trim()
  .min(32, "Invalid reset token")
  .max(256, "Invalid reset token");

const passwordSchema = z
  .string({
    required_error: "Password is required",
  })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters"),
  }),

  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),
  }),

  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const resetPasswordSchema = z
  .object({
    body: z.object({
      password: passwordSchema,

      confirmPassword: z.string({
        required_error: "Confirm password is required",
      }),
    }),

    params: z.object({
      token: resetTokenSchema,
    }),

    query: z.object({}).optional(),
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    path: ["body", "confirmPassword"],
    message: "Password and confirm password do not match",
  });