import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import { Pool } from 'pg';
import v1Router from "./routes/index"

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", v1Router)

export const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
})

app.all('*', (req, res) => {
    res.status(404).json("page not found")
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on ${process.env.PORT || 3000}`)
})
