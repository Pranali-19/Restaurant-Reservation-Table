import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatWidget from "./ChatWidget";

const CustomerLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <ChatWidget />
        </>
    );
};

export default CustomerLayout;