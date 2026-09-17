import {
    formatDate,
    formatTime
} from "../utils/formatters";
import { useLocation, useNavigate } from "react-router-dom";

const Confirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const reservation = location.state?.reservation;

    if (!reservation) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">
                    Reservation not found
                </h2>

                <button
                    onClick={() => navigate("/tables")}
                    className="mt-4 rounded-lg bg-black px-5 py-3 text-white"
                >
                    Book a Table
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

            <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                    ✓
                </div>

                <h1 className="mt-5 text-3xl font-bold">
                    Reservation Confirmed!
                </h1>

                <p className="mt-2 text-gray-600">
                    Thank you for booking with us.
                </p>

                <div className="mt-8 rounded-xl bg-gray-100 p-6 text-left">

                    <p>
                        <strong>Reservation ID:</strong>{" "}
                        {reservation._id}
                    </p>

                    <p className="mt-2">
                        <strong>Name:</strong>{" "}
                        {reservation.customerName}
                    </p>

                    <p className="mt-2">
                        <strong>Table:</strong>{" "}
                        {reservation.table?.tableNumber}
                    </p>

                    <p className="mt-2">
                        <strong>Date:</strong>{" "}
                        {formatDate(reservation.reservationDate)}
                    </p>

                    <p className="mt-2">
                        <strong>Time:</strong>{" "}
                        {formatTime(reservation.reservationTime)}
                    </p>

                    <p className="mt-2">
                        <strong>Guests:</strong>{" "}
                        {reservation.guests}
                    </p>

                    <p className="mt-2">
                        <strong>Status:</strong>{" "}
                        {reservation.status}
                    </p>

                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate("/tables")}
                        className="mt-6 rounded-lg bg-black px-6 py-3 text-white"
                    >
                        Book Another Table
                    </button>

                    <button
                        onClick={() => navigate("/customer/reservations")}
                        className="mt-6 rounded-lg bg-black px-6 py-3 text-white"
                    >
                        See Reservations
                    </button>
                </div>
                    

            </div>

        </div>
    );
};

export default Confirmation;