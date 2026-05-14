import { z } from "zod";

export const addVehicleSchema = z.object({
  body: z.object({
    regNumber: z.string().min(4, "Registration number is required"),
    vehicleType: z.enum(["bike", "car", "commercial"]),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    regNumber: z.string().min(4, "Registration number is required"),
  }),
});
