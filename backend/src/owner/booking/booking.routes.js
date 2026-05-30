import express from "express";
import { ownerBookingController } from "./booking.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

// Owner-only guard: prevents drivers/admins from poking at this surface.
// (Admins have their own /api/admin/bookings tree.)
router.use((req, res, next) => {
  if (req.user?.userType !== "owner") {
    return res.status(403).json({
      status: "error",
      message: "Forbidden: this endpoint is for parking owners only",
    });
  }
  next();
});

/**
 * @openapi
 * /api/owner/bookings:
 *   get:
 *     summary: List Bookings for Owner Parkings
 *     description: |
 *       Returns bookings against any parking lot owned by the authenticated owner.
 *       Use query filters to narrow by status, parking, or date range.
 *     tags: [Owner Booking]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, example: "confirmed,active" }
 *       - in: query
 *         name: parkingId
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
 *       - in: query
 *         name: cursor
 *         schema: { type: string, description: "Last booking id from previous page" }
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 */
router.get("/", ownerBookingController.list);

/**
 * @openapi
 * /api/owner/bookings/summary:
 *   get:
 *     summary: Booking summary for Owner Dashboard
 *     description: Aggregate counts by status plus total earnings (owner share) across all parkings.
 *     tags: [Owner Booking]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 */
router.get("/summary", ownerBookingController.summary);

/**
 * @openapi
 * /api/owner/bookings/{id}:
 *   get:
 *     summary: Get Booking Details (scoped to owner)
 *     description: Detail view of a single booking; access is rejected if the booking belongs to a parking the owner does not own.
 *     tags: [Owner Booking]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found in your inventory
 */
router.get("/:id", ownerBookingController.getById);

export default router;
