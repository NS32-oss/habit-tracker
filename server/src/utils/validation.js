import { z } from 'zod';

export const authValidation = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email'),
      username: z.string().min(3, 'Username must be at least 3 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email'),
      password: z.string(),
    }),
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string(),
    }),
  }),
};

export const habitValidation = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Habit name is required'),
      description: z.string().optional(),
      emoji: z.string().optional().default('🎯'),
      color: z.string().optional().default('#d8b4fe'),
      frequency: z.enum(['daily', 'weekly', 'custom']).default('daily'),
      customDays: z.array(z.number()).optional().default([]),
      targetPerWeek: z.number().optional().default(7),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      emoji: z.string().optional(),
      color: z.string().optional(),
      frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
      customDays: z.array(z.number()).optional(),
      targetPerWeek: z.number().optional(),
      isActive: z.boolean().optional(),
    }),
  }),
};

export const logValidation = {
  create: z.object({
    body: z.object({
      date: z.string().datetime().optional(),
      completed: z.boolean().default(false),
      notes: z.string().optional(),
      mood: z.enum(['😍', '😊', '😐', '😕', '😢', 'none']).optional(),
    }),
  }),
};

export const challengeValidation = {
  create: z.object({
    body: z.object({
      habitId: z.string(),
      name: z.string().min(1, 'Challenge name is required'),
      description: z.string().optional(),
      durationDays: z.number().min(1).max(365),
      targetCompletions: z.number().min(1),
    }),
  }),

  update: z.object({
    body: z.object({
      status: z.enum(['active', 'completed', 'failed', 'paused']).optional(),
      actualCompletions: z.number().optional(),
    }),
  }),
};
