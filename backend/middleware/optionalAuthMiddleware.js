import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Like authMiddleware, but never blocks the request. If a valid
// Bearer token is present, req.user is set; otherwise req.user stays
// null and the request continues as a guest. Used by the chatbot so
// visitors can chat before logging in, while booking tools can still
// tell whether the visitor is authenticated.
const optionalAuthMiddleware = async (req, res, next) => {
    req.user = null;

    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const user = await User.findById(decoded.userId).select(
                "-password"
            );

            req.user = user || null;
        }
    } catch (error) {
        req.user = null;
    }

    next();
};

export default optionalAuthMiddleware;
