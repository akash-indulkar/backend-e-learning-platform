export const getAdminByEmail = `SELECT * FROM admins WHERE email = $1;`
export const createAdmin = `INSERT INTO admins (name, email, password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING admin_id, email, name;`
export const updateAdminById = `UPDATE admins SET name = $1, email = $2, password = $3, profile_picture = $4 WHERE admin_id = $5 RETURNING admin_id, email, name;`
