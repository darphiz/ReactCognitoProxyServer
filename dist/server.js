"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION = void 0;
const express_1 = __importDefault(require("express"));
const auth_router_1 = __importDefault(require("./router/auth.router"));
const drive_router_1 = __importDefault(require("./router/drive.router"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const session_file_store_1 = __importDefault(require("session-file-store"));
const filestore = (0, session_file_store_1.default)(express_session_1.default);
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const secret = process.env.SECRET;
const corsOptions = {
    origin: [process.env.CLIENT_ORIGIN, 'http://localhost:3000'],
    credentials: true
};
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    name: 'sid',
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.APP_MODE === 'development' ? false : true,
        httpOnly: process.env.APP_MODE === 'development' ? false : true,
        sameSite: process.env.APP_MODE === 'development' ? false : 'none',
    },
    store: new filestore({ path: './sessions', retries: 0 })
}));
app.use((0, cookie_parser_1.default)());
app.use('/api', auth_router_1.default);
app.use('/api', drive_router_1.default);
app.get('/api/auth/check', (req, res) => {
    const { AccessToken, AuthType } = req.session;
    if (AccessToken && AuthType) {
        return res.send({ status: "ok", message: "User logged in successfully" });
    }
    else {
        return res.status(401).send({ status: "ko", message: 'User not logged in' });
    }
});
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ status: "ok", message: 'Something went wrong' });
        }
        res.clearCookie('sid');
        res.status(200).send({ status: "ok", message: 'Logged out' });
    });
});
app.all('*', (req, res) => {
    const msg = { status: "ko", message: "Not Found" };
    return res.status(404).send(msg);
});
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map