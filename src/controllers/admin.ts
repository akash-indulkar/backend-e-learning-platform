import { Request, Response } from "express";
import { adminSecretKey } from "../middlewares/auth";
import { pool } from "..";
import { courseSchema, logSchema, signSchema } from "../utils/zod";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import * as AdminQuries from "../models/query/admin"
import * as CourseQueries from "../models/query/course"
import cloudinary from "../utils/cloudinary"
import { resend } from "../utils/resend";

export const getAdmin = async (req: Request, res: Response) => {
  const email = req.email;
  try {
    const fetchQuery = AdminQuries.getAdminByEmail
    const admin = await pool.query(fetchQuery, [email])
    if (!admin.rows[0]) {
      res.status(404).json({ msg: "Admin doesnt exist" })
    } else {
      res.status(200).json({ admin: admin.rows[0] })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong while getting admin details" })
  }
}

export const createAdmin = async (req: Request, res: Response) => {
  const { name, email, password, profile_picture } = req.body;
  const parsedData = signSchema.safeParse({ name, email, password, profile_picture })
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  if (parsedData.success) {
    try {
      const imgData = await cloudinary.uploader.upload(profile_picture, {
        folder: "admins"
      })
      const fetchQuery = AdminQuries.getAdminByEmail
      const admin = await pool.query(fetchQuery, [email])
      if (admin.rows[0]) {
        res.status(409).json({ message: 'Admin already exists' });
      } else {
        const insertQuery = AdminQuries.createAdmin
        const values = [name, email, hashedPass, imgData.secure_url];
        const queryResponse = await pool.query(insertQuery, values);
        const token = jwt.sign({ email, id: queryResponse.rows[0].admin_id, role: 'admin' }, adminSecretKey, { expiresIn: '1h' });
        const result = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'akashindulkar6677@gmail.com',
          subject: 'Happy onboarding',
          text: `Congratulations ${queryResponse.rows[0].name} for creating an Admin Account on e-learning-platform. HAPPY COURSE SELLING!!`
        })
        res.status(201).json({ message: 'Admin created successfully', token });
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Something went wrong while creating admin!" })
    }
  } else {
    res.status(400).json({ message: "You sent wrong inputs!" })
  }
}

export const logAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const parsedData = logSchema.safeParse({ email, password })
  if (parsedData.success) {
    try {
      const fetchQuery = AdminQuries.getAdminByEmail
      const values = [email]
      const admin = await pool.query(fetchQuery, values)
      if (admin) {
        const isAuthorized = await bcrypt.compare(password, admin.rows[0].password)
        if (isAuthorized) {
          const token = jwt.sign({ email, id: admin.rows[0].admin_id, role: 'admin' }, adminSecretKey, { expiresIn: '1h' });
          res.status(200).json({ message: 'Admin logged in successfully', token });
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

export const updateAdmin = async (req: Request, res: Response) => {
  const { name, email, password, profile_picture } = req.body;
  const admin_id = req.id;
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  const parsedData = signSchema.safeParse({ name, email, password, profile_picture })
  if (parsedData.success) {
    try {
      const imgData = await cloudinary.uploader.upload(profile_picture, {
        folder: "admins"
      })
      const updateQuery = AdminQuries.updateAdminById
      const values = [name, email, hashedPass, imgData.secure_url, admin_id]
      const admin = await pool.query(updateQuery, values);
      if (admin.rows[0]) {
        resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'akashindulkar6677@gmail.com',
          subject: 'Profile updated',
          text: `Hello ${admin.rows[0].name}, your profile details has been updated. If it's not you, then contact us immediately`
        })
        res.status(200).json({ message: 'Admin updated successfully' })
      } else {
        res.status(404).json({ message: 'Admin not found' });
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Something went wrong while updating user details!" })
    }
  } else {
    res.status(400).json({ message: "You sent wrong inputs!" })
  }
}

export const createCourse = async (req: Request, res: Response) => {
  const { title, description, category, thumbnail, price } = req.body;
  const admin_id = req.id;
  const parsedData = courseSchema.safeParse({ title, description, category, thumbnail, price })
  if (parsedData.success) {
    try {
      const thumbnailData = await cloudinary.uploader.upload(thumbnail, {
        folder: "courses"
      })
      const insertQuery = CourseQueries.createCourse
      const values = [admin_id, title, description, category, thumbnailData.secure_url, price]
      const course = await pool.query(insertQuery, values);
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'akashindulkar6677@gmail.com',
        subject: 'Course published successfully',
        text: `Hello sir, you've published your course of ${course.rows[0].title} successfully!`
      })
      res.status(201).json({ message: 'Course created successfully', courseId: course.rows[0].course_id });
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Something went wrong while creating the course!" })
    }
  } else {
    res.status(400).json({ message: "You've sent wrong inputs!" })
  }
}

export const updateCourse = async (req: Request, res: Response) => {
  const admin_id = JSON.stringify(req.id);
  const { title, description, category, thumbnail, price } = req.body;
  const courseId = req.params.courseId as string;
  const parsedData = courseSchema.safeParse({ title, description, category, thumbnail, price })
  if (parsedData.success) {
    try {
      const checkQuery = CourseQueries.adminHasCourse
      const checkValues = [courseId, admin_id]
      const hasCourse = await pool.query(checkQuery, checkValues)
      if (hasCourse.rows[0]) {
        const thumbnailData = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses"
        })
        const updateQuery = CourseQueries.updateCourseById
        const updateValues = [title, description, category, thumbnailData.secure_url, price, courseId]
        const course = await pool.query(updateQuery, updateValues);
        if (course.rows[0]) {
          resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'akashindulkar6677@gmail.com',
            subject: 'Course updated successfully',
            text: `Hello sir, you've updated your course of ${course.rows[0].title} successfully!`
          })
          res.status(200).json({ message: 'Course updated successfully' });
        } else {
          res.status(404).json({ message: 'Course not updated' });
        }
      } else {
        res.status(404).json({ message: "You don't have that course!" });
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Something went wrong while updating the course!" })
    }
  } else {
    res.status(400).json({ message: "You sent wrong inputs!" })
  }
}

export const getAllCourses = async (req: Request, res: Response) => {
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

export const getPublishedCourses = async (req: Request, res: Response) => {
  const admin_id = JSON.stringify(req.id)
  const pageNumber = parseInt(req.query.page as string) || 1
  const limit = "4";
  const offset = JSON.stringify(((pageNumber - 1) * parseInt(limit)))
  try {
    const fetchQuery = CourseQueries.getCourseByAdminId
    const values = [admin_id, offset, limit]
    const courses = await pool.query(fetchQuery, values);
    res.status(200).json({ courses: courses.rows });
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong while getting the courses!" })
  }
}

export const getCourse = async (req: Request, res: Response) => {
  const admin_id = JSON.stringify(req.id);
  const courseId = req.params.courseId as string;
  try {
    const fetchQuery = CourseQueries.adminHasCourse
    const values = [courseId, admin_id]
    const course = await pool.query(fetchQuery, values);
    if (course.rows[0]) {
      res.status(200).json({ course: course.rows[0] });
    } else {
      res.status(404).json({ message: "course not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong while getting the course details!" })
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  const admin_id = JSON.stringify(req.id)
  const courseId = req.params.courseId;
  try {
    const checkQuery = CourseQueries.adminHasCourse
    const checkValues = [courseId, admin_id]
    const hasCourse = await pool.query(checkQuery, checkValues)
    if (hasCourse.rows[0]) {
      const deleteQuery = CourseQueries.deleteCourseById
      const values = [courseId];
      const result = await pool.query(deleteQuery, values)
      if (result.rows[0]) {
        resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'akashindulkar6677@gmail.com',
          subject: 'Course deleted successfully',
          text: `Hello sir, you've deleted your course of ${result.rows[0].title} successfully!`
        })
        res.status(200).json({ message: "Course deleted successfully" })
      }
    } else {
      res.status(404).json({ message: "You don't have that course!" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Something went wrong while deleting the course!" })
  }
}

