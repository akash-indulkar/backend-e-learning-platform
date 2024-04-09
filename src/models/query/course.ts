export const createCourse = `INSERT INTO courses (admin_id, title, description, category, thumbnail, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING course_id, title;`
export const updateCourseById = `UPDATE courses SET title = $1, description = $2, category = $3, thumbnail = $4, price = $5 WHERE course_id = $6 RETURNING course_id, title;`
export const getAllCourses = `SELECT * FROM courses OFFSET CAST($1 as INTEGER) LIMIT CAST($2 as INTEGER);`
export const getCoursesByCategory = `SELECT * FROM courses WHERE category = $1 OFFSET CAST($2 as INTEGER) LIMIT CAST($3 as INTEGER);`
export const getCourseByCourseId = `SELECT * FROM courses WHERE course_id = $1;`
export const getCourseByAdminId = `SELECT * FROM courses WHERE admin_id = $1 OFFSET CAST($2 as INTEGER) LIMIT CAST($3 as INTEGER);`
export const adminHasCourse = `SELECT * FROM courses WHERE course_id = $1 AND admin_id = $2;`
export const deleteCourseById = 'DELETE FROM courses WHERE course_id = $1 RETURNING course_id, title;'
export const checkAlreadyPurchased = `SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2;`
export const purchaseCourse = `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING course_id;`
export const getPurchasedCourses = `SELECT c.* FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE e.user_id = $1 OFFSET CAST($2 as INTEGER) LIMIT CAST($3 as INTEGER);`

