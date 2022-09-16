import {Request, Response} from 'express'
// get the app credentials from google cloud platform and save it in a json file
import credentials from '../credentials.json'

import {google} from 'googleapis'
import { AuthSession } from '../server';



const client_id:string = credentials.web.client_id;
const client_secret:string = credentials.web.client_secret;
const redirect_uris:Array<string> = credentials.web.redirect_uris;

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
)


export const googleLogin = (req:Request, res: Response): Response =>{    
    const SCOPE:Array<string> = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file']
    
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
    })

    return res.send({status: "ok", message: "Success", url: authUrl});
}


export const googleCallback = async (req: Request, res: Response) :Promise<Response> => {
    const {code} =  req.query
    if (!code) {
        return res.status(400).send({status: "ko", message: "No code provided"})
    }
    
    try{
        const {tokens} = await oauth2Client.getToken(code as string);     

        (req.session as any).AccessToken = tokens.access_token; 
        (req.session as any).AuthType = "google";


        res.status(301).redirect('http://localhost:3000/api/google/drive')
    }
    catch{
        return res.status(400).send({status: "ko", message: "Error retrieving access token"})
    }
    
}



export const getDriveFiles = async (req: Request, res: Response) :Promise<Response> => {
    
    const {AccessToken, AuthType} = req.session as AuthSession
    
    if (!AuthType || AuthType ==='cognito'){
        return res.send({
            status: "ok",
            message: "Success",
            files: null
        })
    }


    if (!AccessToken) {
        return res.status(401).send({status: "ko", message: "No access token provided"})
    }

    oauth2Client.setCredentials({
        access_token: AccessToken
    })

    const drive = google.drive({version: 'v3', auth: oauth2Client});

    try{

        drive.files.list({
            pageSize: 10
        }, (err, response) => {
            if (err) return res.status(500).send({status: "ko", message: "The API returned an error: " + err});
            const files = response.data.files;
            if (files.length) {
                return res.send({status: "ok", message: "Success", files: files})
            } else {
                return res.status(404).send({status: "ko", message: "No files found"})
            }
        });
    }
    catch (error: any){
        if (error.response.status === 401){
            return res.status(401).send({status: "ko", message: "Invalid access token"})
        }
        return res.status(500).send({status: "ko", message: "Error retrieving files"})
    }

}
