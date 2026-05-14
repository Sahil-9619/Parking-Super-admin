import { z } from "zod";

export const configureAddonsSchema = z.object({
  body: z.object({
    addonsEnabled: z.array(z.string()),
  }),
});

export const updateAddonStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "in_progress", "completed"]),
  }),
});

export const createCustomAddonSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Service name required"),
    price: z.number().nonnegative("Price cannot be negative"),
    description: z.string().optional(),
    image: z.string().url().optional(),
  }),
});
