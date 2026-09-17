import mongoose from "mongoose";

const restaurantTableSchema = new mongoose.Schema(
    {
        tableNumber: {
            type: String,
            required: true,
            unique: true
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        location: {
            type: String,
            default: "Main Hall"
        },

        status: {
            type: String,
            enum: ["available", "maintenance", "inactive"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

const RestaurantTable = mongoose.model(
    "RestaurantTable",
    restaurantTableSchema
);

export default RestaurantTable;