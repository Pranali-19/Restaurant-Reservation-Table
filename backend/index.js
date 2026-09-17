import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "dotenv/config";
import helmet from "helmet";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(helmet());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL,
        ],
        credentials: true
    })
);

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant Reservation API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});