import RestaurantTable from "../models/RestaurantTable.js";
import Reservation from "../models/Resevation.js";

export const ALLOWED_RESERVATION_TIMES = [
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00"
];

// Plain-object versions of the table/reservation logic, safe to call
// from both HTTP controllers and the chatbot tool loop. They never
// touch req/res and always return { success, message?, ... }.

export const searchAvailableTables = async ({ date, time, guests }) => {
    if (!date || !time || guests === undefined || guests === null) {
        return {
            success: false,
            message: "date, time and guests are all required."
        };
    }

    if (!ALLOWED_RESERVATION_TIMES.includes(time)) {
        return {
            success: false,
            message: `time must be one of: ${ALLOWED_RESERVATION_TIMES.join(", ")}.`
        };
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
        return {
            success: false,
            message: "guests must be a whole number of at least 1."
        };
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return {
            success: false,
            message: "date must be a valid date in YYYY-MM-DD format."
        };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (parsedDate < todayStart) {
        return {
            success: false,
            message: "date cannot be in the past."
        };
    }

    const reservations = await Reservation.find({
        reservationDate: parsedDate,
        reservationTime: time,
        status: { $in: ["pending", "confirmed"] }
    }).select("table");

    const bookedTableIds = reservations.map(
        (reservation) => reservation.table
    );

    const availableTables = await RestaurantTable.find({
        status: "available",
        capacity: { $gte: guestCount },
        _id: { $nin: bookedTableIds }
    })
        .sort({ capacity: 1 })
        .select("tableNumber capacity location");

    return {
        success: true,
        count: availableTables.length,
        tables: availableTables.map((table) => ({
            tableId: table._id.toString(),
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location
        }))
    };
};

export const bookTable = async ({
    userId,
    tableId,
    date,
    time,
    guests,
    customerName,
    customerEmail,
    customerPhone,
    specialRequest
}) => {
    if (!userId) {
        return {
            success: false,
            message: "The visitor must be logged in before a reservation can be created."
        };
    }

    if (
        !tableId ||
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !date ||
        !time ||
        guests === undefined ||
        guests === null
    ) {
        return {
            success: false,
            message: "tableId, date, time, guests, customerName, customerEmail and customerPhone are all required."
        };
    }

    if (!/^[0-9a-fA-F]{24}$/.test(tableId)) {
        return {
            success: false,
            message: "tableId is not a valid table id. Call search_tables first to get a real tableId."
        };
    }

    const cleanName = customerName.trim();

    if (cleanName.length < 2) {
        return {
            success: false,
            message: "customerName must contain at least 2 characters."
        };
    }

    const cleanEmail = customerEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        return {
            success: false,
            message: "customerEmail is not a valid email address."
        };
    }

    const cleanPhone = customerPhone.trim().replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
        return {
            success: false,
            message: "customerPhone must be exactly 10 digits."
        };
    }

    if (!ALLOWED_RESERVATION_TIMES.includes(time)) {
        return {
            success: false,
            message: `time must be one of: ${ALLOWED_RESERVATION_TIMES.join(", ")}.`
        };
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return {
            success: false,
            message: "date must be a valid date in YYYY-MM-DD format."
        };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (parsedDate < todayStart) {
        return {
            success: false,
            message: "date cannot be in the past."
        };
    }

    const guestCount = Number(guests);

    if (
        !Number.isInteger(guestCount) ||
        guestCount < 1 ||
        guestCount > 20
    ) {
        return {
            success: false,
            message: "guests must be a whole number between 1 and 20."
        };
    }

    const table = await RestaurantTable.findById(tableId);

    if (!table) {
        return {
            success: false,
            message: "That table could not be found. Call search_tables again."
        };
    }

    if (table.status !== "available") {
        return {
            success: false,
            message: "This table is currently unavailable."
        };
    }

    if (guestCount > table.capacity) {
        return {
            success: false,
            message: `This table can accommodate only ${table.capacity} guests.`
        };
    }

    const normalizedDate = parsedDate.toISOString().split("T")[0];
    const reservationSlot = `${tableId}_${normalizedDate}_${time}`;

    const existingReservation = await Reservation.findOne({
        table: tableId,
        reservationDate: parsedDate,
        reservationTime: time,
        status: { $in: ["pending", "confirmed"] }
    });

    if (existingReservation) {
        return {
            success: false,
            message: "This table has already been reserved for this date and time. Call search_tables again for other options."
        };
    }

    try {
        const reservation = await Reservation.create({
            user: userId,
            table: tableId,
            customerName: cleanName,
            customerEmail: cleanEmail,
            customerPhone: cleanPhone,
            reservationDate: parsedDate,
            reservationTime: time,
            reservationSlot,
            guests: guestCount,
            specialRequest: specialRequest?.trim() || "",
            status: "confirmed"
        });

        const populatedReservation = await Reservation.findById(
            reservation._id
        ).populate("table", "tableNumber capacity location");

        return {
            success: true,
            message: "Reservation confirmed.",
            reservation: {
                id: populatedReservation._id.toString(),
                tableNumber: populatedReservation.table.tableNumber,
                location: populatedReservation.table.location,
                date: normalizedDate,
                time,
                guests: guestCount,
                customerName: cleanName,
                customerEmail: cleanEmail,
                customerPhone: cleanPhone,
                specialRequest: populatedReservation.specialRequest,
                status: populatedReservation.status
            }
        };
    } catch (error) {
        if (error.code === 11000) {
            return {
                success: false,
                message: "This table has already been reserved for this date and time."
            };
        }

        throw error;
    }
};
