import { prisma } from "../../../config/prisma.js";

export class OwnerBookingRepository {
  /**
   * Returns bookings against any parking owned by [ownerId].
   *
   * Filters supported:
   *   - status    — comma-separated list, e.g. "confirmed,active"
   *   - parkingId — single uuid
   *   - from / to — ISO date strings (inclusive on `startTime`)
   *   - limit / cursor (createdAt) — keyset pagination
   */
  async findOwnerBookings(ownerId, { status, parkingId, from, to, limit, cursor } = {}) {
    const where = {
      parking: { ownerId },
    };

    if (status) {
      const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) where.status = statuses[0];
      else if (statuses.length > 1) where.status = { in: statuses };
    }

    if (parkingId) {
      where.parkingId = parkingId;
    }

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    return prisma.booking.findMany({
      where,
      include: {
        parking: {
          select: { id: true, name: true, address: true, photos: true },
        },
        user: {
          select: { id: true, name: true, phone: true },
        },
        addonBookings: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit ? Math.min(parseInt(limit, 10), 200) : 50,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
    });
  }

  async findOwnerBookingById(bookingId, ownerId) {
    return prisma.booking.findFirst({
      where: {
        id: bookingId,
        parking: { ownerId },
      },
      include: {
        parking: true,
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
        addonBookings: true,
      },
    });
  }

  /**
   * Aggregate stats for the owner dashboard. One round trip via `groupBy`
   * keeps this O(1) regardless of booking count.
   */
  async summarize(ownerId) {
    const grouped = await prisma.booking.groupBy({
      by: ["status"],
      where: { parking: { ownerId } },
      _count: { _all: true },
      _sum: { ownerShare: true, grossAmount: true },
    });

    const totals = grouped.reduce(
      (acc, row) => {
        acc.byStatus[row.status] = row._count._all;
        acc.totalEarnings += Number(row._sum.ownerShare ?? 0);
        acc.totalGross += Number(row._sum.grossAmount ?? 0);
        return acc;
      },
      { byStatus: {}, totalEarnings: 0, totalGross: 0 },
    );

    return totals;
  }
}

export const ownerBookingRepository = new OwnerBookingRepository();
