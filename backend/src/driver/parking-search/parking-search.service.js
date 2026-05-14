import { parkingSearchRepository } from "./parking-search.repository.js";
import { AppError } from "../../utils/AppError.js";

export class ParkingSearchService {
  async searchNearbyParkings(params) {
    return await parkingSearchRepository.searchNearbyParkings(params);
  }

  async getParkingDetails(id, vehicleType) {
    const details = await parkingSearchRepository.getParkingDetails(id, vehicleType);
    if (!details) throw new AppError("Parking lot not found", 404);
    return details;
  }
}

export const parkingSearchService = new ParkingSearchService();
