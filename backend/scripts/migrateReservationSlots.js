import dotenv from "dotenv";
import mongoose from "mongoose";
import Reservation from "../models/Resevation.js";

dotenv.config();

const migrateReservationSlots = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log("MongoDB connected");

        const reservations =
            await Reservation.find({
                reservationSlot: {
                    $exists: false
                }
            });

        console.log(
            `Found ${reservations.length} reservations to migrate`
        );

        for (const reservation of reservations) {
            const normalizedDate =
                new Date(
                    reservation.reservationDate
                )
                    .toISOString()
                    .split("T")[0];

            reservation.reservationSlot =
                `${reservation.table}_${normalizedDate}_${reservation.reservationTime}`;

            await reservation.save();
        }

        console.log(
            "Reservation slot migration completed successfully"
        );

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error(
            "Reservation slot migration error:",
            error
        );

        await mongoose.connection.close();

        process.exit(1);
    }
};

migrateReservationSlots();