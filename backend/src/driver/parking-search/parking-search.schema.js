import { z } from "zod";

export const searchParkingSchema = z.object({
  query: z.object({
    latitude: z.string().transform(val => parseFloat(val)),
    longitude: z.string().transform(val => parseFloat(val)),
    radius: z.string().optional().transform(val => (val ? parseInt(val, 10) : 5000)), // Default 5km radius
    vehicleType: z.enum(["bike", "car", "commercial"]),
  }),
});
