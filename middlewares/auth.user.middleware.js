
// Import json web token decoder for user

const {decodeUserAuthenticationToken} = require("../utils/get.new.token")

const authUserMiddleware = (req,res) => {
    const token = req.headers.authorization
    if(!token)return res.status(403).send({"error":"invalid credentials"})
    const decodePart = token.split("Bearer ")[1]
    if(!decodePart)return res.status(403).send({"error":"invalid credentials"})
    const data = decodeUserAuthenticationToken(decodePart)
    if(data['error'])return res.status(403).send(data)
    req.userData = data
    req.next()
}

const extractTheToken = (authorization) => {
    return authorization.split("Bearer ")[1]
}

const forgotPasswordMiddleWare = (req,res,next) => {
    const token = extractTheToken(req.headers.authorization)
    const data = decodeUserAuthenticationToken(token)
    if(data['error'])return res.status(403).send(data)
    if(!data['ableToUpdatePassword'])return res.status(403).send({"error":"bad credentials"})
    req.userId = data['_id']
    next()
}


module.exports = {authUserMiddleware,forgotPasswordMiddleWare}