import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getAdminByEmail } from "../models/adminModel.js";

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // get admin from DB
        const user = await getAdminByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // generate token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email },
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};