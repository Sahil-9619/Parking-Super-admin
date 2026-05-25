import { prisma } from "../../../config/prisma.js";

export class ParkingSearchRepository {
  async searchNearbyParkings({ latitude, longitude, radius, vehicleType }) {
    const parkings = await prisma.$queryRawUnsafe(`
      SELECT p.id, p.name, p.address, p.latitude, p.longitude, p.open_time AS "openTime", p.close_time AS "closeTime", 
             p.avg_rating AS "avgRating", p.is_full AS "isFull", p.addons_enabled AS "addonsEnabled",
             ST_Distance(p.location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)) AS distance_meters
      FROM parkings p
      INNER JOIN parking_slots s ON p.id = s.parking_id
      WHERE p.status = 'active'
        AND p.is_closed = false
        AND s.vehicle_type = '${vehicleType}'
        AND s.available_slots > 0
        AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${radius})
      ORDER BY distance_meters ASC
      LIMIT 50;
    `);

    // Fetch matching pricing rules for these parkings
    if (parkings.length === 0) return [];

    const parkingIds = parkings.map(p => p.id);
    const pricingRules = await prisma.pricingRule.findMany({
      where: {
        parkingId: { in: parkingIds },
        vehicleType,
      },
    });

    const pricingMap = new Map(pricingRules.map(pr => [pr.parkingId, pr]));

    return parkings.map(p => ({
      ...p,
      distance_meters: Math.round(p.distance_meters),
      pricing: pricingMap.get(p.id) || null,
    }));
  }

  async getParkingDetails(id, vehicleType) {
    return await prisma.parking.findUnique({
      where: { id },
      include: {
        slots: {
          where: { vehicleType },
        },
        pricingRules: {
          where: { vehicleType },
        },
      },
    });
  }
}

export const parkingSearchRepository = new ParkingSearchRepository();
