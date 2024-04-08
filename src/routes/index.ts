import express from "express";
const router = express.Router();
import adminRouter from "./v1/admin"
import userRouter from "./v1/user"

router.use("/admin", adminRouter);
router.use("/user", userRouter);

export default router;
