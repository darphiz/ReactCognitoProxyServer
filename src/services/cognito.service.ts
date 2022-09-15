import AWS from 'aws-sdk'
import crypto from 'crypto'


interface CognitoConfig {
    region: string;
    secretHash: string;
}



export const CognitoService = (config: CognitoConfig) => {
    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: config.region
    })

    const generateHash = (username: string, secret: string, clientID:string) => {
        return crypto.createHmac('sha256', secret).update(username + clientID).digest('base64')
    }

    const signIn = async (email: string, password: string) => {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: generateHash(email, config.secretHash, process.env.COGNITO_CLIENT_ID)
            }
        }

        try {
            const response = await cognito.initiateAuth(params).promise()
            return response
        } catch (error) {
            throw error
        }
    }

    const signUp = async (email: string, password: string, userAttributes: Array<any>) => {
        const c_id = process.env.COGNITO_CLIENT_ID
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Password: password,
            Username: email,
            UserAttributes: userAttributes
        }

        try {
            const response = await cognito.signUp(params).promise()
            return response
        } catch (error) {
            throw error
        }
    }

    const confirmSignUp = async (email: string, code: string) => {
        const c_id = process.env.COGNITO_CLIENT_ID
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Username: email,
            ConfirmationCode: code
        }

        try {
            const response = await cognito.confirmSignUp(params).promise()
            return response
        } catch (error) {
            throw error
        }
    }

    const forgotPassword = async (email: string) => {
        const c_id = process.env.COGNITO_CLIENT_ID
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Username: email
        }

        try {
            const response = await cognito.forgotPassword(params).promise()
            return response
        } catch (error) {
            throw error
        }
    }

    const confirmNewPassword = async (email: string, code: string, password: string) => {
        const c_id = process.env.COGNITO_CLIENT_ID
        const params = {
            ClientId: c_id,
            SecretHash: generateHash(email, config.secretHash, c_id),
            Username: email,
            ConfirmationCode: code.toString(),
            Password: password
        }

        try {
            const response = await cognito.confirmForgotPassword(params).promise()
            return response
        } catch (error) {
            throw error
        }
    }



    return {
        signIn,
        signUp,
        confirmSignUp,
        forgotPassword,
        confirmNewPassword
    }
}


