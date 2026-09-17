import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tables from "./pages/Tables";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReservations from "./pages/MyReservations";
import Dashboard from "./pages/admin/Dashboard";
import Reservations from "./pages/admin/Reservations";
import AdminTables from "./pages/admin/Tables";
import AdminRoute from "./components/AdminRoute";
import Customers from "./pages/admin/Customers";
import AdminLayout from "./components/AdminLayout";
import CustomerLayout from "./components/CustomerLayout";   
import Home from "./pages/Home";

function App() {
    return (
        <BrowserRouter>
            
            <Routes>
                {/* Customer Routes */}
                <Route element={<CustomerLayout />}>
                    <Route
                        path="/"
                        element={<Home />}
                    />
                    
                    <Route
                        path="/tables"
                        element={<Tables />}
                    />
                    
                    <Route
                        path="/booking"
                        element={<Booking />}
                    />

                    <Route
                        path="/confirmation"
                        element={<Confirmation />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/customer/reservations"
                        element={<MyReservations />}
                    />
                </Route>

                {/* Protected Admin routes */}
                <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<Dashboard />} />

                        <Route
                            path="/admin/reservations"
                            element={<Reservations />}
                        />

                        <Route
                            path="/admin/tables"
                            element={<AdminTables />}
                        />

                        <Route
                            path="/admin/customers"
                            element={<Customers />}
                        />
                    </Route>
                </Route>
                
            </Routes>

        </BrowserRouter>
    );
}

export default App;