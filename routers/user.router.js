
const router = require("express").Router()


// Argon2 for password hashing
const argon2 = require("argon2")

// Middleware for the user authentication
const { authUserMiddleware, forgotPasswordMiddleWare } = require("../middlewares/auth.user.middleware")

// Imports models 
const UserModel = require("../Models/user.schema")

// Import Representations
const UserRepresentation = require("../Structures/user.class").UserRepresentation

// Email Module
const sendEmail = require("../utils/send_email").sendEmail

// Login with jwt
const {createNewUserAuthToken,decodeUserAuthenticationToken, createUserForgotPasswordToken}  = require("../utils/get.new.token")
const { generateARandomCode } = require("../utils/random.code.gen")

router.get("/",(req,res) => {
    return res.send({
        "name":"user"
    }).status(200)
})


router.post("/signup",async (req,res) => {
    // Create the hash password
    const password = await argon2.hash(req.body.password)

    // Create a user representation
    const user = new UserRepresentation({...req.body,password});

    // Do unique check
    const result = await user.checkUniqueness()
    
    // If not everything unique return an error
    if(result){
        return res.status(result.status).send({'error':result.error})
    }


    try{
        // Create the activation code for the current user
        code = ""
        for (let i = 0 ; i < 6;i++) {
            code += Math.round(Math.random() * 10)
        }
    
        // Create a instance in the database
        const mongodbUser = await UserModel.create({...req.body,activationCode:code,password})
        // If we are failed,return an error
        if(!mongodbUser)return res.status(500).json({"error":"Server Error"})

        let isEmailSent = false;
        try{
            // Send the email
            await sendEmail(user,code)
            isEmailSent = true;
        }catch(ex){
            isEmailSent = false;
        }

        return res.send({user: await UserModel.findOne({_id:mongodbUser._id},['username','email','birthday','createdAt','updatedAt','isActive']),isVerificationSent:isEmailSent}).status(201)
    }catch(ex){
        console.log(ex)
        res.send({"error":"Server Error"}).status(500)
    }
    
})


router.post("/login",async (req,res) => {
    const body = req.body


    if(!body.password || !body.username)return res.status(401).send({"error":"invalid credentials"})

    const user = await UserModel.findOne({username:body.username})
    if(!user)return res.status(401).send({"error":"invalid credentials"})
    
    const passwordMatch = await argon2.verify(user.password,body.password)
    if(!passwordMatch)return res.status(401).send({"error":"invalid credentials"})
    return res.status(200).send({"token":createNewUserAuthToken(user),'type':'Bearer'})
})

router.post("/forgot-password",async (req,res) => {
    console.log(req.body," jell")
    const email = req.body.email 
    console.log(email)
    if(!email)return res.status(400).send({"error":"Email was empty"})
    const user = await UserModel.findOne({email})
    if(!user)return res.status(404).send({"error":"Email was not found"})

    const code = generateARandomCode()
   

    try{
        await sendEmail(user,code)
        user.forgotPasswordCode = code;
        await user.save()
        return res.status(200).send({"sent":true})
    }
    catch(ex){
        return res.status(500).send({"error":"Server Error"})
    }
    
})

router.post("/forgot-password-token",async(req,res) => {
    const code = req.body.code
    const email = req.body.email


    const user = await UserModel.findOne({email:email})


    if(!user)return res.status(403).send({"error":"invalid credentials"})

    if(!user.forgotPasswordCode === code)return res.status(403).send({"error":"invalid credentials"})
    
    const token = createUserForgotPasswordToken(user)

    user.forgotPasswordCode = ''

    await user.save()

    return res.status(200).send({token,'type':"Bearer"})
})

router.post("/forgot-password-change",forgotPasswordMiddleWare,async(req,res) => {
    const newPassword  = await argon2.hash(req.body.password)
    const user  = await UserModel.findOne({_id:req.userId})
    if(!user)return res.status(403).send({"error":"invalid credentials"})

    user.password = newPassword;
    await user.save()

    return res.status(200).send({'changed':'success'})
})


router.use(authUserMiddleware)
router.post("/activate",async (req,res) => {
    const code = req.body.code;
    console.log(code)
    if(!code)return res.status(400).send({"error":"bad details"})
    const user = await UserModel.findOne({_id:req.userData._id})
    if(!user)return res.status(400).send({"error":"bad details"})
   
    if(user.isActive)return res.status(200).send({"activated":"already activated"})
    
    console.log(user.activationCode,code)
    if(user.activationCode === code){

    user.isActive =  true;
    const data = req.userData
    data['isActive'] = true
    const token = createNewUserAuthToken(data)
    await user.save()
    return res.status(200).send({"activated":true,"token":token,"type":"Bearer"})

    }

    return res.status(400).send({"error":"bad details"})
    
    
})

module.exports=router;