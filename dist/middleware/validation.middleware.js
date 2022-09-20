"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateSignUp = exports.validateSignIn = exports.validateConfirmSignUp = void 0;
const express_validator_1 = require("express-validator");
const validateConfirmSignUp = () => {
    return [
        (0, express_validator_1.body)('email', 'Email is required').isEmail().normalizeEmail(),
        (0, express_validator_1.check)('code', 'Code is required').not().isEmpty()
    ];
};
exports.validateConfirmSignUp = validateConfirmSignUp;
const validateSignIn = () => {
    return [
        (0, express_validator_1.body)('email', 'Email is required').isEmail(),
        (0, express_validator_1.check)('password', 'Password is required').not().isEmpty()
    ];
};
exports.validateSignIn = validateSignIn;
const validateSignUp = () => {
    return [
        (0, express_validator_1.check)('full_name', 'Name is required').not().isEmpty(),
        (0, express_validator_1.body)('email', 'Email is required').isEmail().normalizeEmail(),
        (0, express_validator_1.check)('password', 'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long')
            .isStrongPassword()
    ];
};
exports.validateSignUp = validateSignUp;
const validateForgotPassword = () => {
    return [
        (0, express_validator_1.body)('email', 'Email is required').isEmail().normalizeEmail()
    ];
};
exports.validateForgotPassword = validateForgotPassword;
const validateResetPassword = () => {
    return [
        (0, express_validator_1.body)('email', 'Email is required').isEmail().normalizeEmail(),
        (0, express_validator_1.check)('code', '6 digit code is required').isLength({ min: 6 }),
        (0, express_validator_1.check)('password', 'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long')
            .isStrongPassword()
    ];
};
exports.validateResetPassword = validateResetPassword;
//# sourceMappingURL=validation.middleware.js.map