import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {CognitoService} from '../services/cognito.service';
import {AuthSession} from '../server';



export const signIn = async (req:Request, res:Response) : Promise<Response> => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }


    const cognito = CognitoService({
        region: process.env.COGNITO_REGION,
        secretHash: process.env.COGNITO_SECRET_HASH
    })
    
    await cognito.signIn(req.body.email, req.body.password)
    .then((response) => {
            const {AccessToken} = response.AuthenticationResult;
            
            //set token in session
            (req.session as AuthSession).AccessToken = AccessToken;
            (req.session as AuthSession).AuthType = 'cognito';
            
            return res.send({status: "ok", message: "User logged in successfully"})    
        }
    ).catch((error) => {
        switch (error.code) {
            case 'UserNotFoundException':
                return res.status(404).send({status:"ko", message: 'User not found'})
            case 'NotAuthorizedException':
                return res.status(401).send({status:"ko", message: 'Incorrect password'})
            default:
                return res.status(500).send({status:"ko", message: 'Internal Server Error'})

        }
    })

    
}

export const signUp = async (req:Request, res:Response): Promise<Response> => {
    const errors = validationResult(req);
    const {full_name, email, password} = req.body;
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }


    const cognito = CognitoService({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });

    try{
        const response = await cognito.signUp(email, password, [
            {Name: 'name', Value: full_name}
        ]);
        if (response){
            return res.send({status: "ok", message: "Sign Up"});
        }
        return res.status(500).send({status: "ko", message: "Sign Up Error"});
    }
    catch (error: any) {
        switch(error.code){
            case 'UsernameExistsException':
                return res.status(409).send({status: "ko", message: "Email already exists"});
            case 'InvalidParameterException':
                return res.status(422).send({status: "ko", message: "Invalid parameters"});
            case 'InvalidPasswordException':
                return res.status(422).send({status: "ko", message: "Invalid password"});
            default:
                return res.status(500).send({status: "ko", message: "Sign Up Error"});
        }

    }

}


export const confirmSignUp = async (req:Request, res:Response) => {
    const errors = validationResult(req);
    const {email, code} = req.body;
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const cognito = CognitoService({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });

    try{
        const response = await cognito.confirmSignUp(email, code);
        if (response){
            return res.send({status: "ok", message: "Sign Up Confirmed"});
        }
        return res.status(500).send({status: "ko", message: "Confirmation Error"});
    }
    catch (error: any) {
        switch(error.code){
            case 'UserNotFoundException':
                return res.status(404).send({status: "ko", message: "User not found"});
            case 'CodeMismatchException':
                return res.status(422).send({status: "ko", message: "Code mismatch"});
            case 'ExpiredCodeException':
                return res.status(422).send({status: "ko", message: "Code expired"});
            default:
                return res.status(500).send({status: "ko", message: "Confirmation Error"});
        }

    }
}



export const forgotPassword = async (req:Request, res:Response): Promise<Response> => {
    const errors = validationResult(req);
    const {email} = req.body;
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const cognito = CognitoService({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });

    try{
        const response = await cognito.forgotPassword(email);
        if (response){
            return res.send({status: "ok", message: "Password reset code sent"});
        }
        return res.status(500).send({status: "ko", message: "Password reset error"});
    }
    catch (error: any) {
        switch(error.code){
            case 'UserNotFoundException':
                return res.status(404).send({status: "ko", message: "User not found"});
            case 'LimitExceededException':
                return res.status(429).send({status: "ko", message: "Too many requests"});
            default:
                return res.status(500).send({status: "ko", message: "Password reset error"});
        }

    }

}


export const resetPassword = async (req:Request, res:Response): Promise<Response> => {
    const errors = validationResult(req);
    const {email, code, password} = req.body;
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const cognito = CognitoService({
        region: process.env.COGNITO_REGION, secretHash: process.env.COGNITO_SECRET_HASH
    });

    try{
        const response = await cognito.confirmNewPassword(email, code, password);
        if (response){
            return res.send({status: "ok", message: "Password reset"});
        }
        return res.status(500).send({status: "ko", message: "Password reset error"});
    }
    catch (error: any) {
        switch(error.code){
            case 'UserNotFoundException':
                return res.status(404).send({status: "ko", message: "User not found"});
            case 'CodeMismatchException':
                return res.status(422).send({status: "ko", message: "Code mismatch"});
            case 'ExpiredCodeException':
                return res.status(422).send({status: "ko", message: "Code expired"});
            case 'InvalidPasswordException':
                return res.status(422).send({status: "ko", message: "Invalid password"});
            default:
                return res.status(500).send({status: "ko", message: "Password reset error"});
        }

    }

}
