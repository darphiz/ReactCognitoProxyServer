import { body, ValidationChain,check } from "express-validator"


export const validateConfirmSignUp = ():Array<ValidationChain>  => {
    return [
        body('email', 'Email is required').isEmail().normalizeEmail(),
        check('code', 'Code is required').not().isEmpty()
    ]
}


export const validateSignIn = ():Array<ValidationChain>  => {
    return [
        body('email', 'Email is required').isEmail(),
        check('password', 'Password is required').not().isEmpty()
    ]
}

export const validateSignUp = ():Array<ValidationChain>  => {
    return [
        check('full_name', 'Name is required').not().isEmpty(),
        body('email', 'Email is required').isEmail().normalizeEmail(),
        check('password', 
        'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long')
        .isStrongPassword()   ]
}


export const validateForgotPassword = ():Array<ValidationChain>  => {
    return [
        body('email', 'Email is required').isEmail().normalizeEmail()
    ]
}

export const validateResetPassword = ():Array<ValidationChain> => {
    return [
        body('email', 'Email is required').isEmail().normalizeEmail(),
        check('code', '6 digit code is required').isLength({min: 6}),
        check('password', 
        'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long')
        .isStrongPassword()   
    ]
}