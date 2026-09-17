import {
    formatDate,
    formatTime
} from "../utils/formatters";

const ReservationCard = ({
    reservation,
    onCancel
}) => {
    const formattedDate = new Date(
        reservation.reservationDate
    ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });


    const isActive =
        reservation.status === "confirmed" ||
        reservation.status === "pending";

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

                <div>
                    <h3 className="text-xl font-bold">
                        Table {reservation.table?.tableNumber}
                    </h3>

                    <p className="mt-1 text-gray-500">
                        {reservation.table?.location}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                        reservation.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : reservation.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : reservation.status === "completed"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    {reservation.status}
                </span>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

                <div>
                    <p className="text-sm text-gray-500">
                        Date
                    </p>

                    <p className="font-medium">
                        {formatDate(reservation.reservationDate)}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">
                        Time
                    </p>

                    <p className="font-medium">
                        {formatTime(reservation.reservationTime)}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">
                        Guests
                    </p>

                    <p className="font-medium">
                        {reservation.guests}
                    </p>
                </div>

            </div>

            {reservation.specialRequest && (
                <div className="mt-5 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                        Special Request
                    </p>

                    <p className="mt-1">
                        {reservation.specialRequest}
                    </p>
                </div>
            )}

            {isActive && (
                <button
                    onClick={() => onCancel(reservation._id)}
                    className="mt-6 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    Cancel Reservation
                </button>
            )}

        </div>
    );
};

export default ReservationCard;