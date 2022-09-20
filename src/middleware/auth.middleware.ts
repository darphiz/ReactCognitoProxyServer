import { Request, Response, NextFunction } from "express";
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { AuthSession } from "../server";

interface IRes {
    json: () => Promise<any>;
    status: number;
}


interface Ipems {
    [key: string]: string;
}


const verifyCognitoToken = async (token:string) => {
    let pems:Ipems = {};
    
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

        } catch (error:any) {
            throw new Error(error);
        }

    }
    
    await setUp();


    if (!token) {
        throw new Error("No token provided");
    }
    const decodeJwt = jwt.decode(token, { complete: true });
    if (!decodeJwt) {
        throw new Error("Not a valid JWT token");
    }

    const kid = decodeJwt.header.kid;
    let pem = pems[kid]
    if (!pem){
        throw new Error("Invalid token");
    }

    jwt.verify(token, pem, (err, decoded) => {
        if (err) {
            throw new Error("Invalid token");
        }
        return decoded;
    })
    
}


export const validateSession  = async(req:Request, res:Response, next:NextFunction) =>{
    const {AuthType, AccessToken} = req.session as AuthSession;
    if (!AuthType || !AccessToken) {
        return res.status(401).send({status:"ko", message: 'Unauthorized'})
    }

    if (AuthType === 'cognito') {
        try {
            await verifyCognitoToken(AccessToken);
            return next();
        } catch (error:any) {
            return res.status(401).send({status:"ko", message: error.message})
        }
    }

    return next();
    
}


