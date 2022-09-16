import express from "express"
import {googleLogin, googleCallback, getDriveFiles} from "../controllers/drivefiles.controller";
import {validateSession} from "../middleware/auth.middleware";

const router = express.Router();

router.get('/google/login', googleLogin)
router.get('/google/callback', googleCallback)
router.post('/google/drive',validateSession, getDriveFiles)


export default router;