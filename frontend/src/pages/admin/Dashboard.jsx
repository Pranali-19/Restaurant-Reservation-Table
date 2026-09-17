import { useEffect, useState } from "react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalReservations: 0,
        totalCustomers: 0,
        totalTables: 0,
        todayReservations: 0,
        confirmedReservations: 0,
        cancelledReservations: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/stats"
                );

                setStats(response.data.data);

            } catch (error) {
                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard statistics"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: "Total Reservations",
            value: stats.totalReservations
        },
        {
            title: "Customers",
            value: stats.totalCustomers
        },
        {
            title: "Tables",
            value: stats.totalTables
        },
        {
            title: "Today's Bookings",
            value: stats.todayReservations
        },
        {
            title: "Confirmed",
            value: stats.confirmedReservations
        },
        {
            title: "Cancelled",
            value: stats.cancelledReservations
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">

            <div className="mx-auto max-w-6xl">

                <div>
                    <h1 className="text-3xl font-bold">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Welcome back, {user?.name}
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="mt-10 text-center">
                        <p className="text-gray-500">
                            Loading dashboard...
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {cards.map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                                <p className="text-sm text-gray-500">
                                    {card.title}
                                </p>

                                <h2 className="mt-3 text-4xl font-bold">
                                    {card.value}
                                </h2>
                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default Dashboard;