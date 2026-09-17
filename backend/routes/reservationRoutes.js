import express from "express";
import {
    createReservation ,
    getMyReservations,
    cancelReservation
} from "../controllers/reservationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware , createReservation);
router.get("/my", authMiddleware, getMyReservations);
router.patch("/:id/cancel", authMiddleware, cancelReservation);

export default router;