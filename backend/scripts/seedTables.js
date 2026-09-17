import dotenv from "dotenv";
import mongoose from "mongoose";
import RestaurantTable from "../models/RestaurantTable.js";

dotenv.config();

const tables = [
    {
        tableNumber: "T1",
        capacity: 2,
        location: "Window",
        status: "available"
    },
    {
        tableNumber: "T2",
        capacity: 2,
        location: "Main Hall",
        status: "available"
    },
    {
        tableNumber: "T3",
        capacity: 4,
        location: "Main Hall",
        status: "available"
    },
    {
        tableNumber: "T4",
        capacity: 4,
        location: "Window",
        status: "available"
    },
    {
        tableNumber: "T5",
        capacity: 6,
        location: "Private Area",
        status: "available"
    },
    {
        tableNumber: "T6",
        capacity: 8,
        location: "Terrace",
        status: "available"
    }
];

const seedTables = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        await RestaurantTable.deleteMany({});

        await RestaurantTable.insertMany(tables);

        console.log("Restaurant tables inserted successfully");

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    }
};

seedTables();