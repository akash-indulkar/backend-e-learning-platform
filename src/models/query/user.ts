export const getUserByEmail = `SELECT * FROM users WHERE email = $1;`
export const createUser = `INSERT INTO users (name, email, password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING user_id, email, name;`
export const updateUserById = `UPDATE users SET name = $1, email = $2, password = $3, profile_picture = $4 WHERE user_id = $5 RETURNING user_id, email, name;`
