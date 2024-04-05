import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// routes import

import authRouter from "./routes/auth.routes.js";
import buyerRouter from "./routes/buyer.routes.js";
import sellerRouter from "./routes/seller.routes.js";

// routes declaration

app.use("/api/auth", authRouter);
app.use("/api/buyer", buyerRouter);
app.use("/api/seller", sellerRouter);

export default app;
