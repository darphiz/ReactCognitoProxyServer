import { Request, Response, NextFunction } from "express";
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

interface IRes {
    json: () => Promise<any>;
    status: number;
}


interface Ipems {
    [key: string]: string;
}


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    let pems:Ipems = {};
        // get token from cookie
    const token:string = req.cookies['AccessToken']
    const authType = req.body.AuthType || req.cookies["AuthType"] 


    if (authType && authType === 'google'){
        return next()
    }


    const setUp = async () => {
        const region = process.env.COGNITO_REGION;
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
        try {
            const response:IRes = await fetch(url);
            if (response.status !== 200) {
                throw new Error("request failed");
            }
            const data = await response.json();
            const {keys} = data;
            
            for( let i = 0; i < keys.length; i++) {
                const keyId = keys[i].kid;
                const modulus = keys[i].n;
                const exponent = keys[i].e;
                const keyType = keys[i].kty;
                const jwk = { kty: keyType, n: modulus, e: exponent };
                const pem = jwkToPem(jwk);
                pems[keyId] = pem;
            }

        } catch (error) {
            console.log("Could not get keys");
        }

    }
    
    await setUp();


    if (!token) {
        return res.status(401).send({
            status:"ko",
            message: "Access denied. No token provided"
        });
    }
    const decodeJwt = jwt.decode(token, { complete: true });
    if (!decodeJwt) {
        return res.status(401).send({
            status:"ko",
            message: "Access denied. Invalid auth token"
        });
    }

    const kid = decodeJwt.header.kid;
    let pem = pems[kid]
    if (!pem){
        return res.status(401).send({status: "ko", message: "Access denied. Invalid token."});
    }

    jwt.verify(token, pem, (err, decoded) => {
        if (err) {
            return res.status(401).send({status: "ko", message: "Access denied. Invalid token."});
        }
        return next();
    })
}
