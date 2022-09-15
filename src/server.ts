import express from 'express'
import { Request,Response } from 'express'
import authApi from './router/auth.router'
import driveApi from './router/drive.router'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import helmet from "helmet"
import cors from 'cors'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000


app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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

