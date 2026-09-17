import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Clock3,
    Users,
    Armchair,
    MapPin,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import { formatDate } from "../utils/formatters.js";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Booking = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, loading: authLoading } = useAuth();

    const queryParams = new URLSearchParams(
        location.search
    );

    const tableId = queryParams.get("tableId");
    const date = queryParams.get("date");
    const time = queryParams.get("time");
    const guests = queryParams.get("guests");

    const [table, setTable] = useState(null);

    const [customerName, setCustomerName] = useState(
        user?.name || ""
    );

    const [customerEmail, setCustomerEmail] = useState(
        user?.email || ""
    );

    const [customerPhone, setCustomerPhone] = useState("");

    const [specialRequest, setSpecialRequest] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(
                `/login?redirect=${encodeURIComponent(
                    location.pathname + location.search
                )}`,
                { replace: true }
            );
        }
    }, [
        user,
        authLoading,
        navigate,
        location.pathname,
        location.search
    ]);

    useEffect(() => {
        if (
            authLoading ||
            !user ||
            !tableId ||
            !date ||
            !time ||
            !guests
        ) {
            if (
                !authLoading &&
                user &&
                (!tableId ||
                    !date ||
                    !time ||
                    !guests)
            ) {
                setError(
                    "Invalid booking details. Please select a table again."
                );
                setLoading(false);
            }

            return;
        }

        const fetchTable = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/tables`
                );

                const tables = response.data.data || [];

                const selectedTable = tables.find(
                    (item) => item._id === tableId
                );

                if (!selectedTable) {
                    setError(
                        "The selected table is no longer available."
                    );
                    return;
                }

                if (
                    Number(guests) >
                    selectedTable.capacity
                ) {
                    setError(
                        `This table can accommodate only ${selectedTable.capacity} guests.`
                    );
                    return;
                }

                setTable(selectedTable);
            } catch (error) {
                console.error(
                    "Fetch table error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load table details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTable();
    }, [
        authLoading,
        user,
        tableId,
        date,
        time,
        guests
    ]);

    useEffect(() => {
        if (user) {
            setCustomerName(user.name || "");
            setCustomerEmail(user.email || "");
        }
    }, [user]);

    // const formatDate = (dateString) => {
    //     if (!dateString) return "";

    //     return new Date(
    //         `${dateString}T00:00:00`
    //     ).toLocaleDateString("en-IN", {
    //         day: "2-digit",
    //         month: "short",
    //         year: "numeric"
    //     });
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!customerName.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!customerEmail.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!customerPhone.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        if (!/^[0-9]{10}$/.test(customerPhone.trim())) {
            setError(
                "Please enter a valid 10-digit phone number."
            );
            return;
        }

        if (!table) {
            setError(
                "Table details are unavailable."
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post(
                "/reservations",
                {
                    tableId,
                    customerName:
                        customerName.trim(),
                    customerEmail:
                        customerEmail.trim(),
                    customerPhone:
                        customerPhone.trim(),
                    reservationDate: date,
                    reservationTime: time,
                    guests: Number(guests),
                    specialRequest:
                        specialRequest.trim()
                }
            );

            const reservation =
                response.data.data;

            navigate("/confirmation", {
                state: {
                    reservation
                }
            });
        } catch (error) {
            console.error(
                "Create reservation error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to create reservation. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                    <p className="mt-4 text-gray-600">
                        Loading booking details...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (error && !table) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-16">
                <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                        <Armchair
                            size={25}
                            className="text-red-600"
                        />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-gray-900">
                        Booking unavailable
                    </h1>

                    <p className="mt-3 text-gray-600">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/tables")
                        }
                        className="mt-6 rounded-lg bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        Choose Another Table
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    <button
                        onClick={() =>
                            navigate("/tables")
                        }
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={17} />
                        Back to Tables
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Complete your reservation
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Review your table details and enter your
                        contact information.
                    </p>

                </div>
            </section>

            {/* Main */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

                    {/* Reservation Summary */}
                    <div className="h-fit rounded-2xl border bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Selected table
                                </p>

                                <h2 className="mt-1 text-3xl font-bold text-gray-900">
                                    {table?.tableNumber}
                                </h2>
                            </div>

                            <div className="rounded-xl bg-gray-100 p-3">
                                <Armchair size={24} />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">

                            <div className="flex items-center gap-3">
                                <CalendarDays
                                    size={20}
                                    className="text-gray-500"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Date
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {formatDate(date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock3
                                    size={20}
                                    className="text-gray-500"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Time
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {time}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Users
                                    size={20}
                                    className="text-gray-500"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Guests
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {guests}{" "}
                                        {Number(guests) === 1
                                            ? "Guest"
                                            : "Guests"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin
                                    size={20}
                                    className="text-gray-500"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Location
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {table?.location}
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-6 border-t pt-5">
                            <div className="flex items-center gap-2 text-sm text-green-700">
                                <CheckCircle2 size={17} />
                                Table selected
                            </div>
                        </div>

                    </div>

                    {/* Form */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900">
                                Customer details
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Please provide your contact information.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="customerName"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="customerName"
                                    type="text"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="customerEmail"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="customerEmail"
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) =>
                                        setCustomerEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="customerPhone"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="customerPhone"
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) =>
                                        setCustomerPhone(
                                            e.target.value
                                                .replace(
                                                    /\D/g,
                                                    ""
                                                )
                                                .slice(0, 10)
                                        )
                                    }
                                    placeholder="10-digit phone number"
                                    inputMode="numeric"
                                    maxLength={10}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    required
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Enter a 10-digit mobile number.
                                </p>
                            </div>

                            {/* Special Request */}
                            <div>
                                <label
                                    htmlFor="specialRequest"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Special Request{" "}
                                    <span className="font-normal text-gray-400">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    id="specialRequest"
                                    value={specialRequest}
                                    onChange={(e) =>
                                        setSpecialRequest(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Birthday celebration, window seat, etc."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                />

                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {specialRequest.length}/500
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCircle2 size={19} />

                                {submitting
                                    ? "Confirming Reservation..."
                                    : "Confirm Reservation"}
                            </button>

                        </form>

                    </div>

                </div>
            </section>
        </div>
    );
};

export default Booking;