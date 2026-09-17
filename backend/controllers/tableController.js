import RestaurantTable from "../models/RestaurantTable.js";
import Reservation from "../models/Resevation.js";

export const getTables = async (req, res) => {
    try {
        const tables = await RestaurantTable.find({
            status: "available"
        }).sort({
            tableNumber: 1
        });

        res.status(200).json({
            success: true,
            count: tables.length,
            data: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get table. Please try again later."
        });
    }
};

export const getAvailableTables = async (req, res) => {
    try {
        const { date, time, guests } = req.query;

        if (!date || !time || !guests) {
            return res.status(400).json({
                success: false,
                message: "Date, time and guests are required"
            });
        }

        const guestCount = Number(guests);

        if (guestCount < 1) {
            return res.status(400).json({
                success: false,
                message: "Guests must be at least 1"
            });
        }

        // Find reservations for the requested date and time
        const reservations = await Reservation.find({
            reservationDate: new Date(`${date}T00:00:00`),
            reservationTime: time,
            status: {
                $in: ["pending", "confirmed"]
            }
        }).select("table");

        // Get IDs of already booked tables
        const bookedTableIds = reservations.map(
            reservation => reservation.table
        );

        // Find tables that:
        // 1. Are active
        // 2. Have enough capacity
        // 3. Are not already booked
        const availableTables = await RestaurantTable.find({
            status: "available",
            capacity: {
                $gte: guestCount
            },
            _id: {
                $nin: bookedTableIds
            }
        }).sort({
            capacity: 1
        });

        res.status(200).json({
            success: true,
            count: availableTables.length,
            data: availableTables
        });

    } catch (error) {
        console.error("Availability error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get available tables. Please try again later."
        });
    }
};

export const getAllTables = async (req, res) => {
    try {
        const tables = await RestaurantTable.find()
            .sort({ tableNumber: 1 });

        res.status(200).json({
            success: true,
            count: tables.length,
            data: tables
        });
    } catch (error) {
        console.error("Get all tables error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get all tables. Please try again later."
        });
    }
};

export const createTable = async (req, res) => {
    try {
        const {
            tableNumber,
            capacity,
            location,
            status
        } = req.body;

        if (!tableNumber || !capacity) {
            return res.status(400).json({
                success: false,
                message: "Table number and capacity are required"
            });
        }

        const existingTable =
            await RestaurantTable.findOne({
                tableNumber: tableNumber.trim()
            });

        if (existingTable) {
            return res.status(409).json({
                success: false,
                message: "A table with this number already exists"
            });
        }

        const table = await RestaurantTable.create({
            tableNumber: tableNumber.trim(),
            capacity: Number(capacity),
            location: location?.trim() || "Main Hall",
            status: status || "available"
        });

        res.status(201).json({
            success: true,
            message: "Table created successfully",
            data: table
        });
    } catch (error) {
        console.error("Create table error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create table. Please try again later."
        });
    }
};

export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            tableNumber,
            capacity,
            location,
            status
        } = req.body;

        const table =
            await RestaurantTable.findById(id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }

        if (tableNumber) {
            const duplicateTable =
                await RestaurantTable.findOne({
                    tableNumber: tableNumber.trim(),
                    _id: { $ne: id }
                });

            if (duplicateTable) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another table with this number already exists"
                });
            }

            table.tableNumber = tableNumber.trim();
        }

        if (capacity !== undefined) {
            if (Number(capacity) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Capacity must be at least 1"
                });
            }

            table.capacity = Number(capacity);
        }

        if (location !== undefined) {
            table.location =
                location.trim() || "Main Hall";
        }

        if (status !== undefined) {
            const allowedStatuses = [
                "available",
                "maintenance",
                "inactive"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid table status"
                });
            }

            table.status = status;
        }

        await table.save();

        res.status(200).json({
            success: true,
            message: "Table updated successfully",
            data: table
        });
    } catch (error) {
        console.error("Update table error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update table. Please try again later."
        });
    }
};

export const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;

        const table =
            await RestaurantTable.findById(id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }

        const activeReservation =
            await Reservation.findOne({
                table: id,
                status: {
                    $in: ["pending", "confirmed"]
                }
            });

        if (activeReservation) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete a table with active reservations"
            });
        }

        await RestaurantTable.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Table deleted successfully"
        });
    } catch (error) {
        console.error("Delete table error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete table. Please try again later."
        });
    }
};

