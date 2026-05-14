import bcrypt from "bcrypt";
import { prisma } from "./config/prisma.js";

const initializeDb = async () => {
    try {
        console.log("✅ Table 'admins' ready via Prisma schema push");

        const email = "admin@parkadda.com";
        const password = await bcrypt.hash("admin@parkadda", 10);

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        });

        if (!existingAdmin) {
            await prisma.admin.create({
                data: {
                    email,
                    password,
                },
            });
            console.log("✅ Admin created");
        } else {
            console.log("ℹ️ Admin already exists");
        }

        await prisma.$disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Initialization error:", err);
        await prisma.$disconnect();
        process.exit(1);
    }
};

initializeDb();