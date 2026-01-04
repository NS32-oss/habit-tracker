import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(100, "Habit name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  icon: z
    .string()
    .min(1, "Icon is required")
    .max(10, "Icon must be at most 10 characters"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(50, "Color must be at most 50 characters"),
  frequency: z
    .enum(["daily", "weekly", "custom"], {
      errorMap: () => ({ message: "Frequency must be daily, weekly, or custom" }),
    }),
  targetDays: z
    .array(z.string())
    .optional(),
  reminderTime: z
    .string()
    .optional(),
});

export const updateHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(100, "Habit name must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  icon: z
    .string()
    .min(1, "Icon is required")
    .max(10, "Icon must be at most 10 characters")
    .optional(),
  color: z
    .string()
    .min(1, "Color is required")
    .max(50, "Color must be at most 50 characters")
    .optional(),
  frequency: z
    .enum(["daily", "weekly", "custom"], {
      errorMap: () => ({ message: "Frequency must be daily, weekly, or custom" }),
    })
    .optional(),
  targetDays: z
    .array(z.string())
    .optional(),
  reminderTime: z
    .string()
    .optional(),
  isActive: z
    .boolean()
    .optional(),
});

export const createChallengeSchema = z.object({
  name: z
    .string()
    .min(1, "Challenge name is required")
    .max(100, "Challenge name must be at most 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid start date"),
  endDate: z
    .string()
    .min(1, "End date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid end date"),
  targetDays: z
    .number()
    .min(1, "Target days must be at least 1")
    .max(365, "Target days must be at most 365"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters"),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateChallengeSchema = z.object({
  name: z
    .string()
    .min(1, "Challenge name is required")
    .max(100, "Challenge name must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid start date")
    .optional(),
  endDate: z
    .string()
    .min(1, "End date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid end date")
    .optional(),
  targetDays: z
    .number()
    .min(1, "Target days must be at least 1")
    .max(365, "Target days must be at most 365")
    .optional(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters")
    .optional(),
  isActive: z
    .boolean()
    .optional(),
});

export const completeHabitSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid date"),
  note: z
    .string()
    .max(500, "Note must be at most 500 characters")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>;
