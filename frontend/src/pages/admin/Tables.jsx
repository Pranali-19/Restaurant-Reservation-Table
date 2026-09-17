import { useEffect, useState } from "react";
import api from "../../services/api";

const Tables = () => {
    const [tables, setTables] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingTable, setEditingTable] = useState(null);

    const [formData, setFormData] = useState({
        tableNumber: "",
        capacity: "",
        location: "",
        status: "available"
    });

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/tables/admin/all"
            );

            setTables(response.data.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to load tables"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            tableNumber: "",
            capacity: "",
            location: "",
            status: "available"
        });

        setEditingTable(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");
            setSuccess("");

            if (!formData.tableNumber || !formData.capacity) {
                setError(
                    "Table number and capacity are required"
                );
                return;
            }

            if (editingTable) {
                await api.patch(
                    `/tables/admin/${editingTable._id}`,
                    {
                        tableNumber:
                            formData.tableNumber,
                        capacity:
                            Number(formData.capacity),
                        location:
                            formData.location,
                        status:
                            formData.status
                    }
                );

                setSuccess(
                    "Table updated successfully"
                );
            } else {
                await api.post(
                    "/tables/admin",
                    {
                        tableNumber:
                            formData.tableNumber,
                        capacity:
                            Number(formData.capacity),
                        location:
                            formData.location,
                        status:
                            formData.status
                    }
                );

                setSuccess(
                    "Table created successfully"
                );
            }

            resetForm();
            await fetchTables();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to save table"
            );
        }
    };

    const handleEdit = (table) => {
        setEditingTable(table);

        setFormData({
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location,
            status: table.status
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this table?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/tables/admin/${id}`
            );

            setSuccess(
                "Table deleted successfully"
            );

            await fetchTables();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to delete table"
            );
        }
    };

    const getStatusClass = (status) => {
        if (status === "available") {
            return "bg-green-100 text-green-700";
        }

        if (status === "maintenance") {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <p className="text-center text-gray-500">
                        Loading tables...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Table Management
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Add, edit and manage restaurant tables
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTable(null);

                            setFormData({
                                tableNumber: "",
                                capacity: "",
                                location: "",
                                status: "available"
                            });

                            setShowForm(true);
                        }}
                        className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
                    >
                        + Add Table
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
                        {success}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                {editingTable
                                    ? "Edit Table"
                                    : "Add New Table"}
                            </h2>

                            <button
                                onClick={resetForm}
                                className="text-sm text-gray-500 hover:text-gray-900"
                            >
                                Close
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Table Number
                                </label>

                                <input
                                    type="text"
                                    name="tableNumber"
                                    value={
                                        formData.tableNumber
                                    }
                                    onChange={handleChange}
                                    placeholder="T7"
                                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Capacity
                                </label>

                                <input
                                    type="number"
                                    name="capacity"
                                    min="1"
                                    value={
                                        formData.capacity
                                    }
                                    onChange={handleChange}
                                    placeholder="4"
                                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={handleChange}
                                    placeholder="Window"
                                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={handleChange}
                                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="maintenance">
                                        Maintenance
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
                                >
                                    {editingTable
                                        ? "Update Table"
                                        : "Create Table"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tables */}
                <div className="mt-8">

                    {tables.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <h2 className="text-xl font-semibold">
                                No tables found
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Add your first restaurant table.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {tables.map((table) => (
                                <div
                                    key={table._id}
                                    className="rounded-2xl bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {table.tableNumber}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {table.location}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                table.status
                                            )}`}
                                        >
                                            {table.status}
                                        </span>
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-sm text-gray-500">
                                            Capacity
                                        </p>

                                        <p className="mt-1 text-lg font-semibold">
                                            {table.capacity} guests
                                        </p>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={() =>
                                                handleEdit(
                                                    table
                                                )
                                            }
                                            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    table._id
                                                )
                                            }
                                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tables;