"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = express_1.default.Router();
router.post('/auth/login', (0, validation_middleware_1.validateSignIn)(), auth_controller_1.signIn);
router.post('/auth/register', (0, validation_middleware_1.validateSignUp)(), auth_controller_1.signUp);
router.post('/auth/verify', (0, validation_middleware_1.validateConfirmSignUp)(), auth_controller_1.confirmSignUp);
router.post('/auth/forgot', (0, validation_middleware_1.validateForgotPassword)(), auth_controller_1.forgotPassword);
router.post('/auth/reset', (0, validation_middleware_1.validateResetPassword)(), auth_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.router.js.map