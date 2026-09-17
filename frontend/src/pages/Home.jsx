import { Link } from "react-router-dom";
import {
    CalendarDays,
    Clock3,
    Users,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

const Home = () => {
    return (
        <div className="min-h-screen bg-white">

            {/* Hero Section */}
            <section className="bg-gray-950 text-white">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 lg:px-8 lg:py-28">

                    <div>
                        <span className="inline-flex rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300">
                            Simple & Easy Table Booking
                        </span>

                        <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                            Reserve your table
                            <span className="block text-gray-400">
                                in just a few clicks.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
                            Choose your preferred date, time, and table.
                            Make your restaurant reservation quickly and
                            manage your bookings from one place.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/tables"
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-200"
                            >
                                Browse Tables
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg border border-gray-600 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>

                    {/* Hero Card */}
                    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-2xl sm:p-8">
                        <div className="rounded-2xl bg-gray-800 p-6">

                            <p className="text-sm font-medium text-gray-400">
                                Reservation
                            </p>

                            <h2 className="mt-2 text-2xl font-bold">
                                Your table awaits
                            </h2>

                            <div className="mt-8 space-y-4">

                                <div className="flex items-center gap-4 rounded-xl bg-gray-900 p-4">
                                    <div className="rounded-lg bg-gray-800 p-3">
                                        <CalendarDays size={22} />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Date
                                        </p>
                                        <p className="font-medium">
                                            Choose your date
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-xl bg-gray-900 p-4">
                                    <div className="rounded-lg bg-gray-800 p-3">
                                        <Clock3 size={22} />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Time
                                        </p>
                                        <p className="font-medium">
                                            Select your preferred time
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-xl bg-gray-900 p-4">
                                    <div className="rounded-lg bg-gray-800 p-3">
                                        <Users size={22} />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Guests
                                        </p>
                                        <p className="font-medium">
                                            Select number of guests
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Features */}
            <section className="border-b bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Why use Restaurant Reserve?
                        </p>

                        <h2 className="mt-3 text-3xl font-bold text-gray-900">
                            Everything you need to manage your reservation
                        </h2>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <CalendarDays
                                size={28}
                                className="text-gray-900"
                            />

                            <h3 className="mt-5 text-lg font-semibold">
                                Easy Booking
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Select your date, time, guests, and
                                preferred table through a simple booking
                                process.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <CheckCircle2
                                size={28}
                                className="text-gray-900"
                            />

                            <h3 className="mt-5 text-lg font-semibold">
                                Real-Time Availability
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View tables that are available for your
                                selected date and time.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <Users
                                size={28}
                                className="text-gray-900"
                            />

                            <h3 className="mt-5 text-lg font-semibold">
                                Manage Reservations
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View your reservations and cancel upcoming
                                bookings from your account.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white">
                <div className="mx-auto max-w-4xl px-6 py-20 text-center">

                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Ready to reserve your table?
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                        Find an available table and complete your
                        reservation in a few simple steps.
                    </p>

                    <Link
                        to="/tables"
                        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gray-950 px-7 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Find a Table
                        <ArrowRight size={18} />
                    </Link>

                </div>
            </section>

        </div>
    );
};

export default Home;