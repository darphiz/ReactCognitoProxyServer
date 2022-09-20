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
exports.validateSession = void 0;
const jwk_to_pem_1 = __importDefault(require("jwk-to-pem"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const verifyCognitoToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let pems = {};
    const setUp = () => __awaiter(void 0, void 0, void 0, function* () {
        const region = process.env.COGNITO_REGION;
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
        try {
            const response = yield (0, node_fetch_1.default)(url);
            if (response.status !== 200) {
                throw new Error("request failed");
            }
            const data = yield response.json();
            const { keys } = data;
            for (let i = 0; i < keys.length; i++) {
                const keyId = keys[i].kid;
                const modulus = keys[i].n;
                const exponent = keys[i].e;
                const keyType = keys[i].kty;
                const jwk = { kty: keyType, n: modulus, e: exponent };
                const pem = (0, jwk_to_pem_1.default)(jwk);
                pems[keyId] = pem;
            }
        }
        catch (error) {
            throw new Error(error);
        }
    });
    yield setUp();
    if (!token) {
        throw new Error("No token provided");
    }
    const decodeJwt = jsonwebtoken_1.default.decode(token, { complete: true });
    if (!decodeJwt) {
        throw new Error("Not a valid JWT token");
    }
    const kid = decodeJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
        throw new Error("Invalid token");
    }
    jsonwebtoken_1.default.verify(token, pem, (err, decoded) => {
        if (err) {
            throw new Error("Invalid token");
        }
        return decoded;
    });
});
const validateSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { AuthType, AccessToken } = req.session;
    if (!AuthType || !AccessToken) {
        return res.status(401).send({ status: "ko", message: 'Unauthorized' });
    }
    if (AuthType === 'cognito') {
        try {
            yield verifyCognitoToken(AccessToken);
            return next();
        }
        catch (error) {
            return res.status(401).send({ status: "ko", message: error.message });
        }
    }
    return next();
});
exports.validateSession = validateSession;
//# sourceMappingURL=auth.middleware.js.map