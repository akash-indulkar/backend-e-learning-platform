import * as express from "express";

declare global {
    namespace Express {
        interface Request {
            id: number;
            email: string
        }
    }
}