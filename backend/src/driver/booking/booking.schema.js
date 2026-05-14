import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    parkingId: z.string().uuid("Valid parking ID required"),
    vehicleType: z.enum(["bike", "car", "commercial"]),
    durationHours: z.number().positive("Duration must be at least 1 hour"),
    addonServices: z.array(
      z.object({
        customAddonId: z.string().uuid().optional(),
        addonName: z.string().min(1, "Add-on name required"),
        serviceLevel: z.string().optional(),
        amount: z.number().nonnegative("Amount cannot be negative"),
      })
    ).optional(),
  }),
});
