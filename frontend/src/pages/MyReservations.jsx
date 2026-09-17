import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import ReservationCard from "../components/ReservationCard";
import { useAuth } from "../context/AuthContext";

const MyReservations = () => {
    const navigate = useNavigate();

    const { user, loading: authLoading } = useAuth();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/reservations/my"
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
        if (!authLoading && user) {
            fetchReservations();
        }
    }, [authLoading, user]);

    const handleCancel = async (reservationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this reservation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.patch(
                `/reservations/${reservationId}/cancel`
            );

            await fetchReservations();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to cancel reservation"
            );
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading reservations...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">

                <h1 className="text-2xl font-bold">
                    Login Required
                </h1>

                <p className="mt-2 text-gray-600">
                    Please login to view your reservations.
                </p>

                <button
                    onClick={() => navigate("/login")}
                    className="mt-5 rounded-lg bg-black px-5 py-3 text-white"
                >
                    Login
                </button>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">

            <div className="mx-auto max-w-4xl">

                <div className="mb-8">

                    <h1 className="text-3xl font-bold">
                        My Reservations
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Welcome, {user.name}. Manage your
                        restaurant reservations here.
                    </p>

                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {reservations.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                        <h2 className="text-xl font-semibold">
                            No Reservations Yet
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Find a table and make your first
                            reservation.
                        </p>

                        <button
                            onClick={() => navigate("/tables")}
                            className="mt-5 rounded-lg bg-black px-5 py-3 text-white"
                        >
                            Find a Table
                        </button>

                    </div>
                ) : (
                    <div className="space-y-5">

                        {reservations.map((reservation) => (
                            <ReservationCard
                                key={reservation._id}
                                reservation={reservation}
                                onCancel={handleCancel}
                            />
                        ))}

                    </div>
                )}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => navigate("/tables")}
                    className="mt-6 rounded-lg bg-black px-6 py-3 text-white"
                >
                    Book Another Table
                </button>
            </div>
        </div>

    );
};

export default MyReservations;