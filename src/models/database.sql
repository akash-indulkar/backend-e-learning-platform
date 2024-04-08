CREATE DATABASE e_learning_platform;

CREATE TABLE users (
    user_id           SERIAL PRIMARY KEY,
    name              VARCHAR(50) NOT NULL,
    email             VARCHAR(50) UNIQUE NOT NULL,
    password          VARCHAR(255) NOT NULL,
    profile_picture   VARCHAR(555)
);

CREATE TABLE admins(
    admin_id          SERIAL PRIMARY KEY,
    name              VARCHAR(50) NOT NULL,
    email             VARCHAR(50) UNIQUE NOT NULL,
    password          VARCHAR(255) NOT NULL,
    profile_picture   VARCHAR(555)
);

CREATE TABLE courses(
    course_id         SERIAL PRIMARY KEY,
    admin_id          INTEGER NOT NULL,
    title             VARCHAR(50) NOT NULL,
    description       VARCHAR(255) NOT NULL,
    category          VARCHAR(50) NOT NULL,
    thumbnail         VARCHAR(555), 
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    price             INTEGER NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

CREATE TABLE enrollments(
    enrollment_id     SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL,
    course_id         INTEGER NOT NULL,
    enrolled_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);


