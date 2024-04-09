import express from "express";
import * as AdminController from "../../controllers/admin";
import { authenticateAdminJwt } from "../../middlewares/auth";
const router = express.Router();

router.post("/signup", AdminController.createAdmin)
router.post("/login", AdminController.logAdmin);
router.get("/me", authenticateAdminJwt, AdminController.getAdmin);
router.put("/updateprofile", authenticateAdminJwt, AdminController.updateAdmin);
router.post("/courses", authenticateAdminJwt, AdminController.createCourse);
router.put("/courses/:courseId", authenticateAdminJwt, AdminController.updateCourse);
router.get("/courses", authenticateAdminJwt, AdminController.getAllCourses);
router.get("/mypublishedcourses", authenticateAdminJwt, AdminController.getPublishedCourses);
router.get("/course/:courseId", authenticateAdminJwt, AdminController.getCourse);
router.delete("/course/:courseId", authenticateAdminJwt, AdminController.deleteCourse);

export default router;



