import { parkingSearchService } from "./parking-search.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class ParkingSearchController {
  searchNearbyParkings = catchAsync(async (req, res) => {
    const parkings = await parkingSearchService.searchNearbyParkings(req.query);
    res.json({ success: true, data: parkings, message: "Nearby parking lots retrieved successfully" });
  });

  getParkingDetails = catchAsync(async (req, res) => {
    const details = await parkingSearchService.getParkingDetails(req.params.id, req.query.vehicleType || "car");
    res.json({ success: true, data: details, message: "Parking details retrieved successfully" });
  });
}

export const parkingSearchController = new ParkingSearchController();
