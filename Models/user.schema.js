

const userSchema = require("mongoose").Schema(
    {
        username:{
            type:String,
            unique:true,
            required:false,
    
        },
        email:{
            type:String,
            unique:true,
            required:false
        },
        password:{
            type:String,
            unique:true,
            required:false
        },
        fullName:String,
        birthday:String,
        isActive:{
            type:Boolean,
            default:false,
        },
        activationCode:{
            type:String,
            required:true
        },
        lastActivationCodeSentAt:{
            type:Date,
            default:Date.now()
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        forgotPasswordCode:String
        
    }
,{
    timestamps:true
})

module.exports = require("mongoose").model('User',userSchema)