import { prisma } from "../../../config/prisma.js";

export class ReviewsRepository {
  async findAllReviews() {
    // Fetch reviews with reviewer/driver info
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Populate target names (Parking or Addon)
    const parkingIds = reviews
      .filter((r) => r.targetType === "parking")
      .map((r) => r.targetId);
    const addonIds = reviews
      .filter((r) => r.targetType === "addon")
      .map((r) => r.targetId);

    const [parkings, addons] = await Promise.all([
      prisma.parking.findMany({
        where: { id: { in: parkingIds } },
        select: { id: true, name: true },
      }),
      prisma.customAddon.findMany({
        where: { id: { in: addonIds } },
        select: { id: true, name: true },
      }),
    ]);

    const parkingMap = new Map(parkings.map((p) => [p.id, p.name]));
    const addonMap = new Map(addons.map((a) => [a.id, a.name]));

    return reviews.map((review) => {
      let targetName = "Unknown Target";
      if (review.targetType === "parking") {
        targetName = parkingMap.get(review.targetId) || "Deleted Parking";
      } else if (review.targetType === "addon") {
        targetName = addonMap.get(review.targetId) || "Deleted Add-on Service";
      }

      return {
        ...review,
        targetName,
      };
    });
  }

  async deleteReview(id) {
    return await prisma.review.delete({
      where: { id },
    });
  }
}

export const reviewsRepository = new ReviewsRepository();
