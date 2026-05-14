import { z } from "zod";

export const createParkingSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Parking name is required"),
    parkingType: z.enum(["home", "society", "commercial", "govt", "municipality"]),
    address: z.string().min(5, "Full address is required"),
    latitude: z.number().min(-90).max(90, "Valid latitude required"),
    longitude: z.number().min(-180).max(180, "Valid longitude required"),
    openTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Format HH:MM required"),
    closeTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Format HH:MM required"),
    is24hr: z.boolean().default(false),
    addonsEnabled: z.array(z.string()).optional(),
  }),
});

export const updateParkingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "paused", "pending"]),
  }),
});

export const configureSlotsSchema = z.object({
  body: z.object({
    vehicleType: z.enum(["bike", "car", "commercial"]),
    totalSlots: z.number().int().min(0, "Total slots cannot be negative"),
  }),
});

export const configurePricingSchema = z.object({
  body: z.object({
    vehicleType: z.enum(["bike", "car", "commercial"]),
    weekdayPrice: z.number().positive("Price must be positive"),
    weekendPrice: z.number().positive("Price must be positive"),
    peakRules: z.record(z.any()).optional(),
  }),
});
