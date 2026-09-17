import express from "express";
import { 
    getTables,
    getAvailableTables,
    getAllTables,
    createTable,
    updateTable,
    deleteTable
} from "../controllers/tableController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getTables);
router.get("/available", getAvailableTables);

// Admin routes
router.get("/admin/all",authMiddleware, adminMiddleware, getAllTables);
router.post("/admin", authMiddleware, adminMiddleware, createTable);
router.patch("/admin/:id", authMiddleware, adminMiddleware, updateTable);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteTable);



export default router;