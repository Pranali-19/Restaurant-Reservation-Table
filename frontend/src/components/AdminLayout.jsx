import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    Utensils,
    Users,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navigation = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: LayoutDashboard
        },
        {
            name: "Reservations",
            path: "/admin/reservations",
            icon: CalendarDays
        },
        {
            name: "Tables",
            path: "/admin/tables",
            icon: Utensils
        },
        {
            name: "Customers",
            path: "/admin/customers",
            icon: Users
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b bg-white px-4 py-4 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                >
                    <Menu size={24} />
                </button>

                <h1 className="text-lg font-bold text-gray-900">
                    Admin Panel
                </h1>

                <div className="w-10" />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between border-b px-6 py-5">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Restaurant Reserve
                        </h1>

                        <p className="mt-1 text-xs text-gray-500">
                            Admin Panel
                        </p>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Admin Profile */}
                <div className="border-b px-6 py-5">
                    <p className="text-sm font-semibold text-gray-900">
                        {user?.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        {user?.email}
                    </p>

                    <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        Administrator
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 p-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/admin"}
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="border-t p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;