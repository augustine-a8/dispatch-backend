import { Router } from "express";
import { asyncHandler } from "../lib/asyncWrapper";
import { Endpoint } from "../types";
import { login, refreshToken, register } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user using their username and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user.
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incorrect password"
 *       404:
 *         description: Username not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username not found"
 */
router.post("/login", asyncHandler(login));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the user.
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *               password:
 *                 type: string
 *                 description: Password for the user.
 *               contact:
 *                 type: string
 *                 description: Contact information for the user.
 *     responses:
 *       200:
 *         description: Registration successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Register successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Username has been taken.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username has been taken"
 */
router.post("/register", asyncHandler(register));

router.post("/refresh-token", asyncHandler(refreshToken));

const authEndpoint: Endpoint = {
  path: "/auth",
  router,
};

export { authEndpoint };
