import { addonsService } from "./addons.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class AddonsController {
  configureAddons = catchAsync(async (req, res) => {
    const result = await addonsService.configureAddons(req.params.parkingId, req.user.id, req.body);
    res.json(result);
  });

  createCustomAddon = catchAsync(async (req, res) => {
    const result = await addonsService.createCustomAddon(req.params.parkingId, req.user.id, req.body);
    res.status(201).json(result);
  });

  getCustomAddons = catchAsync(async (req, res) => {
    const result = await addonsService.getCustomAddons(req.params.parkingId, req.user.id);
    res.json(result);
  });

  updateCustomAddon = catchAsync(async (req, res) => {
    const result = await addonsService.updateCustomAddon(req.params.addonId, req.user.id, req.body);
    res.json(result);
  });

  getAddonBookings = catchAsync(async (req, res) => {
    const result = await addonsService.getAddonBookings(req.params.parkingId, req.user.id);
    res.json(result);
  });

  updateAddonStatus = catchAsync(async (req, res) => {
    const result = await addonsService.updateAddonStatus(req.params.addonBookingId, req.user.id, req.body.status);
    res.json(result);
  });
}

export const addonsController = new AddonsController();
