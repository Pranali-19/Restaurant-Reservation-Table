import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

                <Link
                    to="/"
                    className="text-xl font-bold text-gray-900"
                >
                    Restaurant Reserve
                </Link>

                

                <div className="flex items-center gap-4">

                    {user && (
                        <span className="hidden text-sm text-gray-600 sm:block">
                            Hi, {user.name}
                        </span>
                    )}

                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700 hover:text-black"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            {user.role === "customer" && (
                                <Link
                                    to="/customer/reservations"
                                    className="hidden text-sm font-medium text-gray-700 hover:text-black sm:block"
                                >
                                    My Reservations
                                </Link>  
                            )}
                                {/* <Link
                                        to="/"
                                        className="hidden text-sm font-medium text-gray-700 hover:text-black sm:block"
                                    >
                                        Home
                                </Link> */}

                            {user.role === "admin" && (
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/admin"
                                        className="text-sm font-medium text-gray-700 hover:text-black"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/admin/reservations"
                                        className="hidden text-sm font-medium text-gray-700 hover:text-black sm:block"
                                    >
                                        Reservations
                                    </Link>

                                    <Link
                                        to="/admin/tables"
                                        className="hidden text-sm font-medium text-gray-700 hover:text-black"
                                    >
                                        Tables
                                    </Link>

                                    <Link
                                        to="/admin/customers"
                                        className="hidden text-sm font-medium text-gray-700 hover:text-black"
                                    >
                                        Customers
                                    </Link>
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Logout
                            </button>
                        </>
                    )}

                </div>
            </div>
        </nav>
    );
};

export default Navbar;