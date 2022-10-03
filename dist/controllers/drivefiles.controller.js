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
exports.getDriveFiles = exports.googleCallback = exports.googleLogin = void 0;
// get the app credentials from google cloud platform and save it in a json file
const credentials_json_1 = __importDefault(require("../credentials.json"));
const googleapis_1 = require("googleapis");
const client_id = credentials_json_1.default.web.client_id;
const client_secret = credentials_json_1.default.web.client_secret;
const redirect_uris = credentials_json_1.default.web.redirect_uris;
const oauth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, "https://files-api-server.herokuapp.com/api/google/callback");
const googleLogin = (req, res) => {
    const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file'];
    const frontend_url = req.header('Origin') || '/api/google/drive';
    const _state = JSON.stringify({
        frontend_url: frontend_url
    });
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
        state: _state
    });
    return res.send({ status: "ok", message: "Success", oauth_url: authUrl });
};
exports.googleLogin = googleLogin;
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    try {
        const { state } = req.query;
        const _state = JSON.parse(state);
        const frontend_url = _state.frontend_url;
        if (!frontend_url) {
            return res.send({ status: "error", message: "Invalid redirect url" });
        }
        if (!code) {
            return res.status(400).send({ status: "ko", message: "No code provided" });
        }
        const { tokens } = yield oauth2Client.getToken(code);
        req.session.AccessToken = tokens.access_token;
        req.session.AuthType = "google";
        res.redirect(302, frontend_url);
        return res.end();
    }
    catch (_a) {
        return res.status(400).send({ status: "ko", message: "Error retrieving access token" });
    }
});
exports.googleCallback = googleCallback;
const getDriveFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { AccessToken, AuthType } = req.session;
    if (!AuthType || AuthType === 'cognito') {
        return res.send({
            status: "ok",
            message: "Success",
            files: []
        });
    }
    if (!AccessToken) {
        return res.status(401).send({ status: "ko", message: "No access token provided" });
    }
    oauth2Client.setCredentials({
        access_token: AccessToken
    });
    const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
    try {
        drive.files.list({
            pageSize: 10
        }, (err, response) => {
            if (err)
                return res.status(500).send({ status: "ko", message: "The API returned an error: " + err });
            const files = response.data.files;
            if (files.length) {
                return res.send({ status: "ok", message: "Success", files: files });
            }
            else {
                return res.status(404).send({ status: "ko", message: "No files found" });
            }
        });
    }
    catch (error) {
        if (error.response.status === 401) {
            return res.status(401).send({ status: "ko", message: "Invalid access token" });
        }
        return res.status(500).send({ status: "ko", message: "Error retrieving files" });
    }
});
exports.getDriveFiles = getDriveFiles;
//# sourceMappingURL=drivefiles.controller.js.map