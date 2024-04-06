import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Documentation",
      version: "1.0.0",
      description: "Documentation for E-commerce marketplace APIs",
    },
    servers: [
      {
        url: "http://localhost:8000/", // Update with your server URL
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API routes folder
};

const specs = swaggerJsdoc(options);

const app = express();

// middlewares

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (_, res) => {
  res.send(
    `<h1>E-commerce APIs: Hybr1d Assignment</h1><h3>Go to <a href="http://localhost:8000/api-docs">http://localhost:8000/api-docs</a> for swagger documentation UI</h3>`
  );
});

// routes import

import authRouter from "./routes/auth.routes.js";
import buyerRouter from "./routes/buyer.routes.js";
import sellerRouter from "./routes/seller.routes.js";

// routes declaration

app.use("/api/auth", authRouter);
app.use("/api/buyer", buyerRouter);
app.use("/api/seller", sellerRouter);

export default app;
