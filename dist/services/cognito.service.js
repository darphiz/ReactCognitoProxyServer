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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const crypto_1 = __importDefault(require("crypto"));
const CognitoService = (config) => {
    const cognito = new aws_sdk_1.default.CognitoIdentityServiceProvider({
        region: config.region
    });
    const generateHash = (username, secret, clientID) => {
        return crypto_1.default.createHmac('sha256', secret).update(username + clientID).digest('base64');
    };
    const signIn = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: generateHash(email, config.secretHash, process.env.COGNITO_CLIENT_ID)
            }
        };
        try {
            const response = yield cognito.initiateAuth(params).promise();
            return response;
        }
        catch (error) {
            throw error;
        }
    });
    const signUp = (email, password, userAttributes) => __awaiter(void 0, void 0, void 0, function* () {
        const c_id = process.env.COGNITO_CLIENT_ID;
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Password: password,
            Username: email,
            UserAttributes: userAttributes
        };
        try {
            const response = yield cognito.signUp(params).promise();
            return response;
        }
        catch (error) {
            throw error;
        }
    });
    const confirmSignUp = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
        const c_id = process.env.COGNITO_CLIENT_ID;
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Username: email,
            ConfirmationCode: code
        };
        try {
            const response = yield cognito.confirmSignUp(params).promise();
            return response;
        }
        catch (error) {
            throw error;
        }
    });
    const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
        const c_id = process.env.COGNITO_CLIENT_ID;
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Username: email
        };
        try {
            const response = yield cognito.forgotPassword(params).promise();
            return response;
        }
        catch (error) {
            throw error;
        }
    });
    const confirmNewPassword = (email, code, password) => __awaiter(void 0, void 0, void 0, function* () {
        const c_id = process.env.COGNITO_CLIENT_ID;
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Username: email,
            ConfirmationCode: code.toString(),
            Password: password
        };
        try {
            const response = yield cognito.confirmForgotPassword(params).promise();
            return response;
        }
        catch (error) {
            throw error;
        }
    });
    return {
        signIn,
        signUp,
        confirmSignUp,
        forgotPassword,
        confirmNewPassword
    };
};
exports.CognitoService = CognitoService;
//# sourceMappingURL=cognito.service.js.map