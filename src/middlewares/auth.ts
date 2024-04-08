import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const adminSecretKey = "akashAdm1nsS3cr3t";
export const userSecretKey = "akashUs3rS3cr3t";

// admin auth middleware
export const authenticateAdminJwt = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, adminSecretKey, (err, admin) => {
            if (err) {
                res.status(403).json({ message: "Authentication faied!", err })
            } else {
                if (typeof admin == "string" || !admin) {
                    res.status(403).json({ message: "Authentication faied!", err })
                } else {
                    req.id = admin.id;
                    req.email = admin.email;
                    next();
                }
            }
        })
    } else {
        res.status(403).json({ message: "Cannot found auth token" });
    }
}

// user auth middleware
export const authenticateUserJwt = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, userSecretKey, (err, user) => {
            if (err) {
                res.status(403).json({ message: "Authentication failed!", err })
            } else {
                if (typeof user == "string" || !user) {
                    res.status(403).json({ message: "Authentication faied!", err })
                } else {
                    req.id = user.id;
                    req.email = user.email;
                    next();
                }
            }
        })
    } else {
        res.status(403).json({ message: "Cannot found auth token" });
    }
}
