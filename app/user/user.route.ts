
import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import { sendEmail } from './user.controller';


const router = Router();

router
        .get("/", userController.getAllUser)
        .get("/:id", userController.getUserById)
        .delete("/:id", userController.deleteUser)
        .post("/", userValidator.createUser, catchError, userController.createUser)
        .put("/:id", userValidator.updateUser, catchError, userController.updateUser)
        .patch("/:id", userValidator.editUser, catchError, userController.editUser)
        .post("/login", userValidator.loginUser, catchError, userController.loginUser)
        .post("/block", userController.blockUser) // POST /api/users/block
        // Resend KYC email
        .post("/resend-kyc-email", userController.resendKYCEmail)

            // Unblock user
        .post("/unblock", userController.unblockUser) // POST /api/users/unblock  
        // .post("/by-admin",roleAuth['ADMIN'], userValidator.createUserByAdmin, catchError,userController.createUserByAdmin)
        .post(
                "/by-admin",
                roleAuth("ADMIN"), // Correct way to call roleAuth
                userValidator.createUserByAdmin,
                catchError,
                userController.createUserByAdmin
            );
          
           
            
            
export default router;


