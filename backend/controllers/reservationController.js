import Reservation from "../models/Resevation.js";
import RestaurantTable from "../models/RestaurantTable.js";

const ALLOWED_TIMES = [
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00", 
];

export const createReservation = async (req, res) => {
    try {
        const {
            tableId,
            customerName,
            customerEmail,
            customerPhone,
            reservationDate,
            reservationTime,
            guests,
            specialRequest
        } = req.body;

        // Required fields
        if (
            !tableId ||
            !customerName ||
            !customerEmail ||
            !customerPhone ||
            !reservationDate ||
            !reservationTime ||
            guests === undefined ||
            guests === null
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Validate table ID
        if (!/^[0-9a-fA-F]{24}$/.test(tableId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid table ID"
            });
        }

        // Validate name
        const cleanName = customerName.trim();

        if (cleanName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Customer name must contain at least 2 characters"
            });
        }

        // Validate email
        const cleanEmail = customerEmail
            .trim()
            .toLowerCase();

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate phone
        const cleanPhone = customerPhone
            .trim()
            .replace(/\D/g, "");

        if (!/^[0-9]{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit phone number"
            });
        }

        // Validate date
        const parsedDate = new Date(
            `${reservationDate}T00:00:00`
        );

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation date"
            });
        }

        // Prevent past dates
        const today = new Date();

        const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        if (parsedDate < todayStart) {
            return res.status(400).json({
                success: false,
                message: "Reservation date cannot be in the past"
            });
        }

        // Validate time
        if (!ALLOWED_TIMES.includes(reservationTime)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation time"
            });
        }

        // Validate guests
        const guestCount = Number(guests);

        if (
            !Number.isInteger(guestCount) ||
            guestCount < 1 ||
            guestCount > 20
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Guests must be a whole number between 1 and 20"
            });
        }

        // Find table
        const table =
            await RestaurantTable.findById(tableId);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }

        // Check table status
        if (table.status !== "available") {
            return res.status(400).json({
                success: false,
                message: "This table is currently unavailable"
            });
        }

        // Check table capacity
        if (guestCount > table.capacity) {
            return res.status(400).json({
                success: false,
                message:
                    `This table can accommodate only ${table.capacity} guests`
            });
        }

        const normalizedDate =
            parsedDate.toISOString().split("T")[0];

        const reservationSlot =
            `${tableId}_${normalizedDate}_${reservationTime}`;

        // Check existing reservation
        const existingReservation =
            await Reservation.findOne({
                table: tableId,
                reservationDate: parsedDate,
                reservationTime,
                status: {
                    $in: [
                        "pending",
                        "confirmed"
                    ]
                }
            });

        if (existingReservation) {
            return res.status(409).json({
                success: false,
                message:
                    "This table has already been reserved for this date and time"
            });
        }

        // Create reservation
        const reservation =
            await Reservation.create({
                user: req.user._id,
                table: tableId,
                customerName: cleanName,
                customerEmail: cleanEmail,
                customerPhone: cleanPhone,
                reservationDate: parsedDate,
                reservationTime,
                reservationSlot,
                guests: guestCount,
                specialRequest:
                    specialRequest?.trim() || "",
                status: "confirmed"
            });

        // Return populated reservation
        const populatedReservation =
            await Reservation.findById(
                reservation._id
            )
                .populate(
                    "table",
                    "tableNumber capacity location"
                )
                .populate(
                    "user",
                    "name email"
                );

        res.status(201).json({
            success: true,
            message:
                "Reservation created successfully",
            data: populatedReservation
        });

    } catch (error) {
        console.error("Create reservation error:",error);

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This table has already been reserved for this date and time"
            });
        }

        res.status(500).json({
            success: false,
            message: 
            "Failed to create reservation",
            error: error.message
        });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({
            user: req.user._id
        })
            .populate("table")
            .sort({ reservationDate: -1 });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });

    } catch (error) {
        console.error(
            "Get reservations error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch reservations.Please try again later.",
            error: error.message
        });
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findOne({
            _id: id,
            user: req.user._id
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }

        if (reservation.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Reservation is already cancelled"
            });
        }

        if (reservation.status === "completed") {
            return res.status(400).json({
                success: false,
                message:
                    "Completed reservations cannot be cancelled"
            });
        }

        reservation.status = "cancelled";

        await reservation.save();

        const updatedReservation =
            await Reservation.findById(reservation._id)
                .populate("table");

        res.status(200).json({
            success: true,
            message: "Reservation cancelled successfully",
            data: updatedReservation
        });

    } catch (error) {
        console.error("Cancel reservation error:",error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel reservation.Please try again later.",           
        });
    }
};

