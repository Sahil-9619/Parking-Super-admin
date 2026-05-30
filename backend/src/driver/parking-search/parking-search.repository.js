import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma.js";

export class ParkingSearchRepository {
  /**
   * Distance-bounded search using PostGIS ST_DWithin + geography index.
   *
   * IMPORTANT: previous revisions used $queryRawUnsafe with string
   * interpolation — that left `vehicleType`, `latitude`, `longitude`, and
   * `radius` as SQL-injection sinks even behind auth. This now uses
   * tagged-template parameter binding (Prisma.sql + $queryRaw) so the
   * driver layer sends real bound parameters to Postgres.
   */
  async searchNearbyParkings({ latitude, longitude, radius, vehicleType }) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const rad = Number(radius);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(rad)) {
      return [];
    }

    const parkings = await prisma.$queryRaw(Prisma.sql`
      SELECT p.id,
             p.name,
             p.address,
             p.latitude,
             p.longitude,
             p.open_time   AS "openTime",
             p.close_time  AS "closeTime",
             p.is_24hr     AS "is24hr",
             p.avg_rating  AS "avgRating",
             p.is_full     AS "isFull",
             p.addons_enabled AS "addonsEnabled",
             p.photos      AS "photos",
             ST_Distance(
               p.location,
               ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
             ) AS distance_meters
      FROM parkings p
      INNER JOIN parking_slots s ON p.id = s.parking_id
      WHERE p.status = 'active'
        AND p.is_closed = false
        AND s.vehicle_type = ${vehicleType}::"VehicleType"
        AND s.available_slots > 0
        AND ST_DWithin(
              p.location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
              ${rad}
            )
      ORDER BY distance_meters ASC
      LIMIT 50;
    `);

    if (parkings.length === 0) return [];

    const parkingIds = parkings.map((p) => p.id);
    const pricingRules = await prisma.pricingRule.findMany({
      where: {
        parkingId: { in: parkingIds },
        vehicleType,
      },
    });

    const pricingMap = new Map(pricingRules.map((pr) => [pr.parkingId, pr]));

    return parkings.map((p) => ({
      ...p,
      distance_meters: Math.round(Number(p.distance_meters)),
      pricing: pricingMap.get(p.id) || null,
    }));
  }

  async getParkingDetails(id, vehicleType) {
    return await prisma.parking.findUnique({
      where: { id },
      include: {
        slots: { where: { vehicleType } },
        pricingRules: { where: { vehicleType } },
      },
    });
  }
}

export const parkingSearchRepository = new ParkingSearchRepository();
