// user.routes.ts

import { Router } from 'express';
import * as userController from './user.controller';
import * as userValidator from './user.validation';
import { roleAuth } from '../common/middleware/role-auth.middleware';
import { catchError } from '../common/middleware/cath-error.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 */
router.get('/', userController.getAllUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the user
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["USER", "ADMIN"]
 *     responses:
 *       201:
 *         description: Successfully created the user
 *       400:
 *         description: Invalid input
 */
router.post("/", userValidator.createUser, catchError, userController.createUser);

/**
 * @swagger
 * /api/users/{id}/block:
 *   post:
 *     summary: Block a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to block
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully blocked the user
 *       404:
 *         description: User not found
 */
router.post("/block", userController.blockUser);

/**
 * @swagger
 * /api/users/by-admin:
 *   post:
 *     summary: Create a new user by admin
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["USER", "ADMIN"]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  "/by-admin",
  roleAuth("ADMIN"), 
  userValidator.createUserByAdmin,
  catchError,
  userController.createUserByAdmin
);

export default router;