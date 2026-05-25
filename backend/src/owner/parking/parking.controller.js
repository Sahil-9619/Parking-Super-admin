import { parkingService } from "./parking.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class ParkingController {
  createParking = catchAsync(async (req, res) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    const parking = await parkingService.createParking(req.user.id, req.body, clientIp);
    res.status(201).json({ success: true, data: parking, message: "Parking lot created successfully" });
  });

  getParkings = catchAsync(async (req, res) => {
    const parkings = await parkingService.getParkings(req.user.id);
    res.json({ success: true, data: parkings, message: "Parking lots retrieved successfully" });
  });

  getParkingById = catchAsync(async (req, res) => {
    const parking = await parkingService.getParkingById(req.params.id, req.user.id);
    res.json({ success: true, data: parking, message: "Parking details retrieved successfully" });
  });

  updateParking = catchAsync(async (req, res) => {
    const parking = await parkingService.updateParking(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: parking, message: "Parking lot updated successfully" });
  });

  updateStatus = catchAsync(async (req, res) => {
    const parking = await parkingService.updateStatus(req.params.id, req.user.id, req.body.status);
    res.json({ success: true, data: parking, message: "Parking status updated successfully" });
  });

  deleteParking = catchAsync(async (req, res) => {
    const result = await parkingService.deleteParking(req.params.id, req.user.id);
    res.json(result);
  });

  configureSlots = catchAsync(async (req, res) => {
    const result = await parkingService.configureSlots(req.params.id, req.user.id, req.body);
    res.json(result);
  });

  configurePricing = catchAsync(async (req, res) => {
    const result = await parkingService.configurePricing(req.params.id, req.user.id, req.body);
    res.json(result);
  });
}

export const parkingController = new ParkingController();
