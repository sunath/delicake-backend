


const UserModel = require("../Models/user.schema")

// Import the email function 
const emailSender = require("../utils/send_email")

class UserRepresentation {
    
    username = "";
    password = "";
    activationCode = "";
    email = "";
    isActive = "";
    createdAt = "";
    isAdmin = ""
    fullName = ""
    birthday = ""
    
    constructor(data){
        this.username = data['username']
        this.password = data['password']
        this.activationCode = data['activationCode']
        this.email = data['email']
        this.createdAt = data['createdAt']
        this.isAdmin = data['isAdmin']
        this.birthday = data['birthday']
        this.userCode = '0000'
    }

    async checkUniqueness() {
        const user = await UserModel.findOne({username:this.username})
        if(user)return {'status':403,'error':'User is already exist'}
        const email = await UserModel.findOne({email:this.email})
        if(email)return {'status':403,'error':'Email  already has been taken'}
        const password = await UserModel.findOne({password:this.password})
        if(password)return {'status':403,'error':'Try a another password'}
    }
}



module.exports = {UserRepresentation}