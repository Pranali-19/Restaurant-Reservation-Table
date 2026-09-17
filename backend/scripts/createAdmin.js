import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        const adminEmail = "admin@restaurant.com";

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin already exists");

            await mongoose.connection.close();
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            10
        );

        const admin = await User.create({
            name: "Restaurant Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });

        console.log(
            "Admin created successfully:",
            admin.email
        );

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {
        console.error(
            "Admin creation error:",
            error.message
        );

        process.exit(1);
    }
};

createAdmin();