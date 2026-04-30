import express from "express";
import { loginAdmin } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// login route
router.post("/login", loginAdmin);

router.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user,
    });
});

export default router;