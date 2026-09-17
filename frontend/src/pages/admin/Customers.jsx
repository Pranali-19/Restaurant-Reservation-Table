import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters.js";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/customers"
            );

            setCustomers(response.data.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to load customers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

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
                        Loading customers...
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
                        Customers
                    </h1>

                    <p className="mt-2 text-gray-600">
                        View registered restaurant customers
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {customers.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold">
                            No customers found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Registered customers will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                        {/* Desktop */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">

                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Reservations
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Joined
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Role
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {customers.map(
                                        (customer) => (
                                            <tr
                                                key={
                                                    customer._id
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {
                                                            customer.name
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {
                                                        customer.email
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        {
                                                            customer.reservationCount
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(
                                                        customer.createdAt
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                        {
                                                            customer.role
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>

                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-4 p-4 md:hidden">
                            {customers.map(
                                (customer) => (
                                    <div
                                        key={customer._id}
                                        className="rounded-xl border p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="font-semibold">
                                                    {
                                                        customer.name
                                                    }
                                                </h2>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {
                                                        customer.email
                                                    }
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                {
                                                    customer.role
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Reservations
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {
                                                        customer.reservationCount
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Joined
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {formatDate(
                                                        customer.createdAt
                                                    )}
                                                </p>
                                            </div>
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

export default Customers;