

const jwt = require("jsonwebtoken")
const secret = process.env.AUTH_USER_TOKEN
const authUserTokenExpiresIn = process.env.EXPIRES_IN

const createNewUserAuthToken = (user) => {
    return jwt.sign({
        username:user.username,
        email:user.email,
        isActive:user.isActive,
        isAdmin:user.isAdmin,
        _id:user._id
    },
    secret
    ,
    {
        expiresIn:authUserTokenExpiresIn
    }
    )
}


const createUserForgotPasswordToken = (user) => {
    const data = {
        username:user.username,
        email:user.email,
        _id:user._id,
        createdAt:user.createdAt,
        updatedAt:user.updatedAt,
        ableToUpdatePassword:true
    }

    const token = jwt.sign(data,secret,{expiresIn:60*5})
    return token
}

const decodeUserAuthenticationToken = (token) => {
    try{
        const data  = jwt.verify(token,secret)
        return data
    }catch(ex){
        if(ex instanceof(jwt.TokenExpiredError)){
            return {'error':'expired'}
        }else if(ex instanceof(jwt.JsonWebTokenError)){
            return {'error':'invalid token'}
        }
    }
    
}

module.exports = {createNewUserAuthToken,decodeUserAuthenticationToken,createUserForgotPasswordToken}