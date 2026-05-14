import { uploadService } from "./upload.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class UploadController {
  getPresignedUrl = catchAsync(async (req, res) => {
    const data = await uploadService.generatePresignedUrl(req.query);
    res.json({ success: true, data, message: "Presigned URL generated successfully" });
  });
}

export const uploadController = new UploadController();
