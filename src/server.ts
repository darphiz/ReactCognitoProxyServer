import express from 'express'
import { Request,Response } from 'express'
import authApi from './router/auth.router'
import driveApi from './router/drive.router'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import helmet from "helmet"
import cors from 'cors'
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
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    session({
        name: 'sid',
        secret: secret,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
        store: new filestore({path: './sessions', retries: 0})
    })
)

app.use(cookieParser())
app.use('/api', authApi)
app.use('/api', driveApi)

app.all('*', (req: Request, res: Response) => {
    const msg = {status: "ko", message: "Not Found"}
    return res.status(404).send(msg)
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});

