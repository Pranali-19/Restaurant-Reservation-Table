import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Clock3,
    Users,
    Search,
    MapPin,
    Armchair
} from "lucide-react";
import api from "../services/api";
import { formatDate , formatTime} from "../utils/formatters.js";

const Tables = () => {
    const navigate = useNavigate();

    const getToday = () => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        
        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(getToday());
    const [time, setTime] = useState("05:00");
    const [guests, setGuests] = useState("2");

    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    const timeOptions = [
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00", 
    ];

    const handleSearch = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);
        setSearched(true);

        try {
            const response = await api.get(
                "/tables/available",
                {
                    params: {
                        date,
                        time,
                        guests
                    }
                }
            );

            setTables(response.data.data || []);
        } catch (error) {
            console.error(
                "Availability search error:",
                error
            );

            setTables([]);

            setError(
                error.response?.data?.message ||
                "Unable to check table availability"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTable = (table) => {
        navigate(
            `/booking?tableId=${table._id}&date=${date}&time=${time}&guests=${guests}`
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Restaurant Reserve
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                        Find your perfect table
                    </h1>

                    <p className="mt-3 max-w-2xl text-gray-600">
                        Choose your date, preferred time, and number of
                        guests to see available tables.
                    </p>

                </div>
            </section>

            {/* Search Section */}
            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    <form
                        onSubmit={handleSearch}
                        className="grid gap-4 rounded-2xl border bg-gray-50 p-5 md:grid-cols-4"
                    >

                        {/* Date */}
                        <div>
                            <label
                                htmlFor="reservation-date"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Date
                            </label>

                            <div className="relative">
                                <CalendarDays
                                    size={19}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                />

                                <input
                                    id="reservation-date"
                                    type="date"
                                    value={date}
                                    min={getToday()}
                                    onChange={(e) =>
                                        setDate(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    required
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div>
                            <label
                                htmlFor="reservation-time"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Time
                            </label>

                            <div className="relative">
                                <Clock3
                                    size={19}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                />

                                <select
                                    id="reservation-time"
                                    value={time}
                                    onChange={(e) =>
                                        setTime(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    required
                                >
                                    {timeOptions.map(
                                        (option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Guests */}
                        <div>
                            <label
                                htmlFor="guests"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Guests
                            </label>

                            <div className="relative">
                                <Users
                                    size={19}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                />

                                <select
                                    id="guests"
                                    value={guests}
                                    onChange={(e) =>
                                        setGuests(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    required
                                >
                                    {Array.from(
                                        { length: 8 },
                                        (_, index) =>
                                            index + 1
                                    ).map((number) => (
                                        <option
                                            key={number}
                                            value={number}
                                        >
                                            {number}{" "}
                                            {number === 1
                                                ? "Guest"
                                                : "Guests"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Search size={19} />

                                {loading
                                    ? "Checking..."
                                    : "Find Tables"}
                            </button>
                        </div>

                    </form>

                </div>
            </section>

            {/* Results */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Initial State */}
                {!searched && !loading && (
                    <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Search size={25} />
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-gray-900">
                            Search for available tables
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-gray-500">
                            Select your preferred date, time, and number
                            of guests above to find suitable tables.
                        </p>

                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                        <p className="mt-5 font-medium text-gray-700">
                            Checking table availability...
                        </p>

                    </div>
                )}

                {/* No Results */}
                {searched &&
                    !loading &&
                    !error &&
                    tables.length === 0 && (
                        <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                <Armchair size={25} />
                            </div>

                            <h2 className="mt-5 text-xl font-semibold text-gray-900">
                                No tables available
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-gray-500">
                                We couldn't find an available table for
                                {` ${guests} `}
                                {Number(guests) === 1
                                    ? "guest"
                                    : "guests"}{" "}
                                at {time} on {date}.
                            </p>

                            <p className="mt-3 text-sm text-gray-500">
                                Try another time, date, or guest count.
                            </p>

                        </div>
                    )}

                {/* Results */}
                {searched &&
                    !loading &&
                    tables.length > 0 && (
                        <>
                            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Available tables
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                        {tables.length}{" "}
                                        {tables.length === 1
                                            ? "table"
                                            : "tables"}{" "}
                                        available
                                    </h2>
                                </div>

                                <div className="rounded-lg bg-white px-4 py-3 text-sm text-gray-600 shadow-sm ring-1 ring-gray-200">
                                    {formatDate(date)} · {formatTime(time)} · {guests}{" "}
                                    {Number(guests) === 1
                                        ? "guest"
                                        : "guests"}
                                </div>

                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                                {tables.map((table) => (
                                    <div
                                        key={table._id}
                                        className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >

                                        {/* Table Header */}
                                        <div className="flex items-start justify-between">

                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Table
                                                </p>

                                                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                                    {table.tableNumber}
                                                </h3>
                                            </div>

                                            <div className="rounded-xl bg-gray-100 p-3">
                                                <Armchair size={23} />
                                            </div>

                                        </div>

                                        {/* Details */}
                                        <div className="mt-6 space-y-3">

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Users size={18} />

                                                <span>
                                                    Up to{" "}
                                                    <strong className="text-gray-900">
                                                        {table.capacity}
                                                    </strong>{" "}
                                                    guests
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <MapPin size={18} />

                                                <span>
                                                    {table.location}
                                                </span>
                                            </div>

                                        </div>

                                        {/* Status */}
                                        <div className="mt-6">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                                Available
                                            </span>
                                        </div>

                                        {/* Select */}
                                        <button
                                            onClick={() =>
                                                handleSelectTable(
                                                    table
                                                )
                                            }
                                            className="mt-6 w-full rounded-lg bg-gray-950 px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
                                        >
                                            Select Table
                                        </button>

                                    </div>
                                ))}

                            </div>
                        </>
                    )}

            </section>
        </div>
    );
};

export default Tables;