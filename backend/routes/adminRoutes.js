import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { getAdminStats, 
    getAllReservations , 
    updateReservationStatus,
    getAllCustomers,
} from "../controllers/adminController.js";

const router = express.Router();

router.get(
    "/test",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted",
            admin: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    }  
);

router.get("/stats",authMiddleware, adminMiddleware, getAdminStats);

router.get("/reservations", authMiddleware, adminMiddleware, getAllReservations);

router.patch("/reservations/:id/status", authMiddleware, adminMiddleware, updateReservationStatus);

router.get("/customers", authMiddleware, adminMiddleware, getAllCustomers);

export default router;