import express from "express";
import * as UserController from "../../controllers/user";
import { authenticateUserJwt } from "../../middlewares/auth";
const router = express.Router();

router.post("/signup", UserController.createUser)
router.post("/login", UserController.logUser);
router.get("/me", authenticateUserJwt, UserController.getUser);
router.put("/updateprofile", authenticateUserJwt, UserController.updateUser);
router.get("/courses", authenticateUserJwt, UserController.getCourses)
router.post("/courses/:courseId", authenticateUserJwt, UserController.purchaseCourse);
router.get("/purchasedCourses", authenticateUserJwt, UserController.getPurchasedCourses);

export default router;