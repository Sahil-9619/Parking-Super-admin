import { vehicleService } from "./vehicle.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class VehicleController {
  getVehicles = catchAsync(async (req, res) => {
    const vehicles = await vehicleService.getVehicles(req.user.id);
    res.json({ success: true, data: vehicles, message: "Vehicles retrieved successfully" });
  });

  addVehicle = catchAsync(async (req, res) => {
    const vehicle = await vehicleService.addVehicle(req.user.id, req.body);
    res.status(201).json({ success: true, data: vehicle, message: "Vehicle added successfully" });
  });

  updateVehicle = catchAsync(async (req, res) => {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.user.id, req.body.regNumber);
    res.json({ success: true, data: vehicle, message: "Vehicle updated successfully" });
  });

  setActiveVehicle = catchAsync(async (req, res) => {
    const vehicle = await vehicleService.setActiveVehicle(req.params.id, req.user.id);
    res.json({ success: true, data: vehicle, message: "Active vehicle updated successfully" });
  });

  deleteVehicle = catchAsync(async (req, res) => {
    const result = await vehicleService.deleteVehicle(req.params.id, req.user.id);
    res.json(result);
  });
}

export const vehicleController = new VehicleController();
