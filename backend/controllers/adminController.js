import User from "../models/User.js";
import RestaurantTable from "../models/RestaurantTable.js";
import Reservation from "../models/Resevation.js";

export const getAdminStats = async (req, res) => {
    try {
        const today = new Date();

        const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
        );

        const [
            totalReservations,
            totalCustomers,
            totalTables,
            todayReservations,
            confirmedReservations,
            cancelledReservations
        ] = await Promise.all([
            Reservation.countDocuments(),

            User.countDocuments({
                role: "customer"
            }),

            RestaurantTable.countDocuments(),

            Reservation.countDocuments({
                reservationDate: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }),

            Reservation.countDocuments({
                status: "confirmed"
            }),

            Reservation.countDocuments({
                status: "cancelled"
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalReservations,
                totalCustomers,
                totalTables,
                todayReservations,
                confirmedReservations,
                cancelledReservations
            }
        });

    } catch (error) {
        console.error(
            "Admin stats error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to get fetch admin statistics. Please try again later.",
        });
    }
};

export const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate("table", "tableNumber capacity location")
            .populate("user", "name email")
            .sort({
                reservationDate: 1,
                reservationTime: 1
            });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.error("Get all reservations error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get all fetch reservations.Please try again later.",

        });
    }
};

export const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "cancelled",
            "completed"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation status"
            });
        }

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }

        const updatedReservation =
            await Reservation.findByIdAndUpdate(
                id,
                { $set: { status } },
                {
                    new: true,
                    runValidators: false
                }
            )
                .populate(
                    "table",
                    "tableNumber capacity location"
                )
                .populate("user", "name email");

        res.status(200).json({
            success: true,
            message: "Reservation status updated successfully",
            data: updatedReservation
        });
    } catch (error) {
        console.error(
            "Update reservation status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update reservation status.Please try again later.",     
        });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({
            role: "customer"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        const customersWithReservations =
            await Promise.all(
                customers.map(async (customer) => {
                    const reservationCount =
                        await Reservation.countDocuments({
                            user: customer._id
                        });

                    return {
                        ...customer.toObject(),
                        reservationCount
                    };
                })
            );

        res.status(200).json({
            success: true,
            count: customersWithReservations.length,
            data: customersWithReservations
        });
    } catch (error) {
        console.error(
            "Get all customers error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to get all fetch customers.Please try again later.",
        });
    }
};
