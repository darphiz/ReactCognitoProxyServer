import express from "express"
import {googleLogin, googleCallback, getDriveFiles} from "../controllers/drivefiles.controller";
import {verifyToken} from "../middleware/auth.middleware";

const router = express.Router();

router.get('/google/login', googleLogin)
router.get('/google/callback', googleCallback)
router.post('/google/drive',verifyToken, getDriveFiles)


export default router;