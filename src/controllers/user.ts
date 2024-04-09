import { Request, Response } from "express";
import { userSecretKey } from "../middlewares/auth";
import { pool } from "..";
import { logSchema, signSchema } from "../utils/zod";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import * as UserQueries from "../models/query/user"
import * as CourseQueries from "../models/query/course"
import cloudinary from "../utils/cloudinary";
import { resend } from "../utils/resend";

export const getUser = async (req: Request, res: Response) => {
    const email = req.email;
    try {
        const fetchQuery = UserQueries.getUserByEmail
        const user = await pool.query(fetchQuery, [email])
        if (!user.rows[0]) {
            res.status(404).json({ msg: "User doesnt exist" })
        } else {
            res.status(200).json({ user: user.rows[0] })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Something went wrong while getting user details" })
    }
}

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, profile_picture } = req.body;
    const parsedData = signSchema.safeParse({ name, email, password, profile_picture })
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    if (parsedData.success) {
        try {
            const imgData = await cloudinary.uploader.upload(profile_picture, {
                folder: "users"
            })
            const fetchQuery = UserQueries.getUserByEmail
            const user = await pool.query(fetchQuery, [email])
            if (user.rows[0]) {
                res.status(409).json({ message: 'User already exists' });
            } else {
                const insertQuery = UserQueries.createUser
                const values = [name, email, hashedPass, imgData.secure_url];
                const queryResponse = await pool.query(insertQuery, values);
                const token = jwt.sign({ email, id: queryResponse.rows[0].user_id, role: 'user' }, userSecretKey, { expiresIn: '1h' });
                resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'akashindulkar6677@gmail.com',
                    subject: 'Happy onboarding',
                    text: `Congratulation ${queryResponse.rows[0].name} for creating an User Account on e-learning-platform. HAPPY LEARNING!!`
                })
                res.status(201).json({ message: 'User created successfully', token });
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: "Something went wrong while creating user!" })
        }
    } else {
        res.status(400).json({ message: "You sent wrong inputs!" })
    }
}

export const logUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const parsedData = logSchema.safeParse({ email, password })
    if (parsedData.success) {
        try {
            const fetchQuery = UserQueries.getUserByEmail
            const values = [email]
            const user = await pool.query(fetchQuery, values)
            if (user.rows[0]) {
                const isAuthorized = await bcrypt.compare(password, user.rows[0].password)
                if (isAuthorized) {
                    const token = jwt.sign({ email, id: user.rows[0].user_id, role: 'user' }, userSecretKey, { expiresIn: '1h' });
                    res.status(200).json({ message: 'User logged in successfully', token });
                } else {
                    res.status(401).json({ message: 'Incorrect password' });
                }
            } else {
                res.status(400).json({ message: 'Invalid Email' });
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: "Something went wrong while logging in!" })
        }
    } else {
        res.status(400).json({ message: "You sent wrong inputs!" })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { name, email, password, profile_picture } = req.body;
    const user_id = req.id;
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const parsedData = signSchema.safeParse({ name, email, password, profile_picture })
    if (parsedData.success) {
        try {
            const imgData = await cloudinary.uploader.upload(profile_picture, {
                folder: "users"
            })
            const updateQuery = UserQueries.updateUserById
            const values = [name, email, hashedPass, imgData.secure_url, user_id]
            const user = await pool.query(updateQuery, values);
            if (user.rows[0]) {
                resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'akashindulkar6677@gmail.com',
                    subject: 'Profile updated',
                    text: `Hello ${user.rows[0].name}, your profile details has been updated. If it's not you, then contact us immediately`
                })
                res.status(200).json({ message: 'User updated successfully' })
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: "Something went wrong while updating user details!" })
        }
    } else {
        res.status(400).json({ message: "You sent wrong inputs!" })
    }
}

export const getCourses = async (req: Request, res: Response) => {
    const category = req.query.category as string
    const pageNumber = parseInt(req.query.page as string) || 1
    const limit = "4";
    const offset = JSON.stringify(((pageNumber - 1) * parseInt(limit)))
    try {
        const fetchQuery = category ? CourseQueries.getCoursesByCategory : CourseQueries.getAllCourses
        const values = category ? [category, offset, limit] : [offset, limit]
        const courses = await pool.query(fetchQuery, values);
        res.status(200).json({ courses: courses.rows });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Something went wrong while getting the courses!" })
    }
}

export const purchaseCourse = async (req: Request, res: Response) => {
    const userId = JSON.stringify(req.id);
    const courseId = req.params.courseId as string;
    try {
        const fetchQuery = CourseQueries.getCourseByCourseId
        const fetchQueryValues = [courseId];
        const course = await pool.query(fetchQuery, fetchQueryValues);
        if (course.rows[0]) {
            const getEnrollmentQuery = CourseQueries.checkAlreadyPurchased
            const getEnrollmentQueryValues = [userId, courseId];
            const enrollment = await pool.query(getEnrollmentQuery, getEnrollmentQueryValues);
            if (!enrollment.rows[0]) {
                try {
                    await pool.query('BEGIN');
                    // payment logic will be here i.e. Razorpay api, PayU api etc.
                    const purchaseQuery = CourseQueries.purchaseCourse
                    const purchaseQueryValues = [userId, courseId];
                    const purchasedCourse = await pool.query(purchaseQuery, purchaseQueryValues);
                    await pool.query('COMMIT');
                    resend.emails.send({
                        from: 'onboarding@resend.dev',
                        to: 'akashindulkar6677@gmail.com',
                        subject: 'Course purchased successfully',
                        text: `Hello sir, you've purchased the course of ${course.rows[0].title} successfully!`
                    })
                    res.status(200).json({ message: 'Course purchased successfully' });
                } catch (err) {
                    await pool.query('ROLLBACK');
                    res.status(500).json({ message: "Payment failed!" })
                    console.error(err)
                }
            } else {
                res.status(409).json({ message: 'Course already purchased!' })
            }
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (err) {
        console.error(err)
        res.json({ message: "Something went wrong while purchasing the course!" })
    }
}

export const getPurchasedCourses = async (req: Request, res: Response) => {
    const userId = JSON.stringify(req.id);
    const pageNumber = parseInt(req.query.page as string) || 1
    const limit = "4";
    const offset = JSON.stringify(((pageNumber - 1) * parseInt(limit)))
    try {
        const fetchQuery = CourseQueries.getPurchasedCourses
        const values = [userId, offset, limit];
        const courses = await pool.query(fetchQuery, values);
        res.status(200).json({ purchasedCourses: courses.rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Something went wrong while getting your purchased courses!" })
    }
}
