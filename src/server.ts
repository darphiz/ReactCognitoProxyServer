import express, { NextFunction } from 'express'
import { Request,Response } from 'express'
import authApi from './router/auth.router'
import driveApi from './router/drive.router'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import helmet from "helmet"
import fs from 'session-file-store'
import { Session } from "express-session";


export interface AuthSession extends Session {
    AccessToken?: string;
    AuthType?: string;
}



const filestore:fs.FileStore = fs(session)

export let SESSION:Array<any>

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const secret:string = process.env.SECRET 


app.use(helmet())


app.use((req:Request, res:Response, next:NextFunction) =>{
   
    res.set('credentials', 'include');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Origin', req.headers.origin);
    res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
} );

app.options('*',  (req:Request, res:Response) => {
    res.sendStatus(200);
    }
);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("trust proxy", 1);
app.use(
    session({
        name: 'sid',
        secret: secret,
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: { 
            secure: process.env.APP_MODE === 'development' ? false : true,
            httpOnly: process.env.APP_MODE === 'development' ? false : true,
            sameSite: process.env.APP_MODE === 'development' ? 'lax' : 'none',
         },
        store: new filestore({path: './sessions', retries: 0})
    })
)
app.use(cookieParser())
app.use('/api', authApi)
app.use('/api', driveApi)

app.get('/api/auth/check', (req:Request, res:Response) => {
    const {AccessToken, AuthType} = req.session as AuthSession
    if(AccessToken && AuthType){
        return res.send({status: "ok", message: "User logged in successfully"})
    }else{
        return res.status(401).send({status:"ko", message: 'User not logged in'})
    }
})

app.post('/api/auth/logout', (req:Request, res:Response) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({status: "ok", message: 'Something went wrong'})
        }
        res.clearCookie('sid')
        res.status(200).send({status: "ok", message: 'Logged out'})
    })
})


app.all('*', (req: Request, res: Response) => {
    const msg = {status: "ko", message: "Not Found"}
    return res.status(404).send(msg)
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});

