import express from "express"
import { signIn, signUp, confirmSignUp, forgotPassword, resetPassword} from "../controllers/auth.controller";
import { validateConfirmSignUp, validateSignIn, validateSignUp, validateForgotPassword, validateResetPassword } from "../middleware/validation.middleware";


const router = express.Router();


router.post('/auth/login', validateSignIn(), signIn)
router.post('/auth/register', validateSignUp(), signUp)
router.post('/auth/verify', validateConfirmSignUp(), confirmSignUp)
router.post('/auth/forgot', validateForgotPassword(), forgotPassword)
router.post('/auth/reset', validateResetPassword(), resetPassword)


export default router;