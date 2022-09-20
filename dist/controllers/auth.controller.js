"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.confirmSignUp = exports.signUp = exports.signIn = void 0;
const express_validator_1 = require("express-validator");
const cognito_service_1 = require("../services/cognito.service");
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const cognito = (0, cognito_service_1.CognitoService)({
        region: process.env.COGNITO_REGION,
        secretHash: process.env.COGNITO_SECRET_HASH
    });
    yield cognito.signIn(req.body.email, req.body.password)
        .then((response) => {
        const { AccessToken } = response.AuthenticationResult;
        //set token in session
        req.session.AccessToken = AccessToken;
        req.session.AuthType = 'cognito';
        return res.send({ status: "ok", message: "User logged in successfully" });
    }).catch((error) => {
        switch (error.code) {
            case 'UserNotFoundException':
                return res.status(404).send({ status: "ko", message: 'User not found' });
            case 'NotAuthorizedException':
                return res.status(401).send({ status: "ko", message: 'Incorrect credentials' });
            default:
                return res.status(500).send({ status: "ko", message: 'Internal Server Error' });
        }
    });
});
exports.signIn = signIn;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    const { full_name, email, password } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const cognito = (0, cognito_service_1.CognitoService)({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });
    try {
        const response = yield cognito.signUp(email, password, [
            { Name: 'name', Value: full_name }
        ]);
        if (response) {
            return res.status(200).send({ status: "ok", message: "Sign Up" });
        }
        return res.status(500).send({ status: "ko", message: "Sign Up Error" });
    }
    catch (error) {
        switch (error.code) {
            case 'UsernameExistsException':
                return res.status(409).send({ status: "ko", message: "Email already exists" });
            case 'InvalidParameterException':
                return res.status(422).send({ status: "ko", message: "Invalid parameters" });
            case 'InvalidPasswordException':
                return res.status(422).send({ status: "ko", message: "Invalid password" });
            default:
                return res.status(500).send({ status: "ko", message: "Sign Up Error" });
        }
    }
});
exports.signUp = signUp;
const confirmSignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    const { email, code } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const cognito = (0, cognito_service_1.CognitoService)({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });
    try {
        const response = yield cognito.confirmSignUp(email, code);
        if (response) {
            return res.send({ status: "ok", message: "Sign Up successfull" });
        }
        return res.status(500).send({ status: "ko", message: "Confirmation Error" });
    }
    catch (error) {
        switch (error.code) {
            case 'UserNotFoundException':
                return res.status(404).send({ status: "ko", message: "User not found" });
            case 'CodeMismatchException':
                return res.status(422).send({ status: "ko", message: "Code mismatch" });
            case 'ExpiredCodeException':
                return res.status(422).send({ status: "ko", message: "Code expired" });
            default:
                return res.status(500).send({ status: "ko", message: "Confirmation Error" });
        }
    }
});
exports.confirmSignUp = confirmSignUp;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    const { email } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const cognito = (0, cognito_service_1.CognitoService)({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });
    try {
        const response = yield cognito.forgotPassword(email);
        if (response) {
            return res.send({ status: "ok", message: "Password reset code sent" });
        }
        return res.status(500).send({ status: "ko", message: "Password reset error" });
    }
    catch (error) {
        switch (error.code) {
            case 'UserNotFoundException':
                return res.status(404).send({ status: "ko", message: "User not found" });
            case 'LimitExceededException':
                return res.status(429).send({ status: "ko", message: "Too many requests" });
            default:
                return res.status(500).send({ status: "ko", message: "Password reset error" });
        }
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    const { email, code, password } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const cognito = (0, cognito_service_1.CognitoService)({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });
    try {
        const response = yield cognito.confirmNewPassword(email, code, password);
        if (response) {
            return res.send({ status: "ok", message: "Password reset" });
        }
        return res.status(500).send({ status: "ko", message: "Password reset error" });
    }
    catch (error) {
        switch (error.code) {
            case 'UserNotFoundException':
                return res.status(404).send({ status: "ko", message: "User not found" });
            case 'CodeMismatchException':
                return res.status(422).send({ status: "ko", message: "Code mismatch" });
            case 'ExpiredCodeException':
                return res.status(422).send({ status: "ko", message: "Code expired" });
            case 'InvalidPasswordException':
                return res.status(422).send({ status: "ko", message: "Invalid password" });
            default:
                return res.status(500).send({ status: "ko", message: "Password reset error" });
        }
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map