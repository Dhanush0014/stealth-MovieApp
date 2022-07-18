const Connector = require('./db/Connector');
const bcrypt = require('bcryptjs');

class Auth {

    static isValid(cookies,headers,url) {

        if(!cookies){
            if (!headers || (url === "login" || url==="/register")) {
                return Promise.resolve("NoAuthorizationRequired");
            }
            else{
                let buffer = this.dcryptHeader(headers);
                let user = buffer[0];
                let password = buffer[1];
                return Connector.getInstance().user.getUser(user)
                .then((userData)=>{
                    if(!userData){
                        console.log("unautnorized because user data not found");
                        return Promise.reject("Unauthorized");
                    }
                    return bcrypt.hash(password, 12);
                })
                .then(hashedPswd=>{
                    return bcrypt.compare(password, hashedPswd);
                }).then(valid=>{
                    if(valid){
                        console.log('[no cookies]');
                        console.log("Adding Cookies....")
                        return Promise.resolve(user);
                    }
                    console.log("unautnorized because password did not match");
                    return Promise.reject("Unauthorized");
                }).catch((err)=>{
                    console.log("error in no cookies");
                    console.log(err);
                    return Promise.reject(err);
                })
            }
        }
        else{
            //checking in the existence of User;
            
           return this.validUser(cookies)
           .then((response)=>{
               console.log("in cookie level")
               console.log(response);
               return Promise.resolve(response);
           }).catch((err)=>{
               console.log("err in cookies")
               console.log(err);
               return Promise.reject(err);
           })
        }
    }

    static dcryptHeader(headers){
        let buffer =new Buffer.from(headers.split(" ")[1], 'base64')
        buffer=buffer.toString().split(":")
        return buffer
    }

    static validUser(user){
        return Connector.getInstance().user.getUser(user)
        .then((userData)=>{
            console.log("user data from [validUser]")
            console.log(userData)
            if(!userData){
                console.log("error in [validuser]")
                return Promise.reject("Unauthorized");
            }
               return Promise.resolve(user);
        })
       
    }
}

module.exports = Auth