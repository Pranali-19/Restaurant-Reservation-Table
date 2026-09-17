import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    formatDate,
    formatTime
} from "../../utils/formatters";

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/reservations"
            );

            setReservations(response.data.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to load reservations"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(
                `/admin/reservations/${id}/status`,
                { status }
            );

            await fetchReservations();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to update reservation"
            );
        }
    };

    // const formatDate = (date) => {
    //     return new Date(date).toLocaleDateString(
    //         "en-IN",
    //         {
    //             day: "2-digit",
    //             month: "short",
    //             year: "numeric"
    //         }
    //     );
    // };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <p className="text-center text-gray-500">
                        Loading reservations...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Reservations
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage all restaurant reservations
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {reservations.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No reservations found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            There are currently no reservations.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Table
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Time
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Guests
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {reservations.map(
                                        (reservation) => (
                                            <tr
                                                key={
                                                    reservation._id
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold">
                                                        {
                                                            reservation
                                                                .table
                                                                ?.tableNumber
                                                        }
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            reservation
                                                                .table
                                                                ?.location
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="font-medium">
                                                        {
                                                            reservation.customerName
                                                        }
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            reservation.customerEmail
                                                        }
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            reservation.customerPhone
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm">
                                                    {formatDate(
                                                        reservation.reservationDate
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm">
                                                    {
                                                        reservation.reservationTime
                                                    }
                                                </td>

                                                <td className="px-6 py-4 text-sm">
                                                    {
                                                        reservation.guests
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            reservation.status ===
                                                            "confirmed"
                                                                ? "bg-green-100 text-green-700"
                                                                : reservation.status ===
                                                                  "cancelled"
                                                                ? "bg-red-100 text-red-700"
                                                                : reservation.status ===
                                                                  "completed"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                    >
                                                        {
                                                            reservation.status
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">

                                                        {reservation.status !==
                                                            "confirmed" &&
                                                            reservation.status !==
                                                                "completed" &&
                                                            reservation.status !==
                                                                "cancelled" && (
                                                                <button
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            reservation._id,
                                                                            "confirmed"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                                                                >
                                                                    Confirm
                                                                </button>
                                                            )}

                                                        {reservation.status !==
                                                            "cancelled" &&
                                                            reservation.status !==
                                                                "completed" && (
                                                                <button
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            reservation._id,
                                                                            "cancelled"
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}

                                                        {reservation.status ===
                                                            "confirmed" && (
                                                            <button
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        reservation._id,
                                                                        "completed"
                                                                    )
                                                                }
                                                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="space-y-4 p-4 md:hidden">
                            {reservations.map(
                                (reservation) => (
                                    <div
                                        key={reservation._id}
                                        className="rounded-xl border p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="font-semibold">
                                                    Table{" "}
                                                    {
                                                        reservation
                                                            .table
                                                            ?.tableNumber
                                                    }
                                                </h2>

                                                <p className="text-sm text-gray-500">
                                                    {
                                                        reservation
                                                            .table
                                                            ?.location
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    reservation.status ===
                                                    "confirmed"
                                                        ? "bg-green-100 text-green-700"
                                                        : reservation.status ===
                                                          "cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : reservation.status ===
                                                          "completed"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {
                                                    reservation.status
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-1 text-sm">
                                            <p>
                                                <strong>
                                                    Customer:
                                                </strong>{" "}
                                                {
                                                    reservation.customerName
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    Email:
                                                </strong>{" "}
                                                        {
                                                            reservation.customerEmail
                                                        }
                                            </p>

                                            <p>
                                                <strong>
                                                    Phone:
                                                </strong>{" "}
                                                        {
                                                            reservation.customerPhone
                                                        }
                                            </p>

                                            <p>
                                                <strong>
                                                    Date:
                                                </strong>{" "}
                                                {formatDate(reservation.reservationDate)}
                                            </p>

                                            <p>
                                                <strong>
                                                    Time:
                                                </strong>{" "}
                                                {formatTime(reservation.reservationTime)}
                                            </p>

                                            <p>
                                                <strong>
                                                    Guests:
                                                </strong>{" "}
                                                {
                                                    reservation.guests
                                                }
                                            </p>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">

                                            {reservation.status !==
                                                "confirmed" &&
                                                reservation.status !==
                                                    "completed" &&
                                                reservation.status !==
                                                    "cancelled" && (
                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                reservation._id,
                                                                "confirmed"
                                                            )
                                                        }
                                                        className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}

                                            {reservation.status !==
                                                "cancelled" &&
                                                reservation.status !==
                                                    "completed" && (
                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                reservation._id,
                                                                "cancelled"
                                                            )
                                                        }
                                                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                            {reservation.status ===
                                                "confirmed" && (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            reservation._id,
                                                            "completed"
                                                        )
                                                    }
                                                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservations;