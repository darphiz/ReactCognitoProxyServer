"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const drivefiles_controller_1 = require("../controllers/drivefiles.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/google/login', drivefiles_controller_1.googleLogin);
router.get('/google/callback', drivefiles_controller_1.googleCallback);
router.all('/google/drive', auth_middleware_1.validateSession, drivefiles_controller_1.getDriveFiles);
exports.default = router;
//# sourceMappingURL=drive.router.js.map