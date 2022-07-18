const userModel = require('./db/Schema/user')
const bcrypt = require('bcryptjs');

class Auth {

    static isValid(cookies, headers, url) {

        if (!cookies) {
            if (!headers ) {
                if(url === "login" || url === "/register")
                return Promise.resolve("NoAuthenticateRequired");
                else{
                    return Promise.reject({message:"Invalid user request required Headers"})
                }
            }
            else if (url === "/logout") {

                //if suppose trying to logout without login

                return Promise.reject({ message: "user not loged in" });
            }
            else {
                let buffer = this.dcryptHeader(headers);
                let user = buffer[0];
                let password = buffer[1];
                return userModel.getUser(user)
                    .then((userData) => {
                        if (!userData) {
                            console.info("[Auth] invalid User because user data not found");
                            return Promise.reject({message:"inValid User"});
                        }
                        return bcrypt.hash(password, 12);
                    })
                    .then(hashedPswd => {
                        return bcrypt.compare(password, hashedPswd);
                    }).then(valid => {
                        if (valid) {
                            console.info('[no cookies]');
                            console.info("Adding Cookies....")
                            return Promise.resolve(user);
                        }
                        console.error("[Auth] invalid user because password did not match[Auth]");
                        return Promise.reject({message:"inValid User"});
                    }).catch((err) => {
                        console.info("error in no cookies");
                        console.error(err);
                        return Promise.reject(err);
                    })
            }
        }
        else {

            if(!headers){
                console.info("[Auth] request without both header and cookies")
                return Promise.reject({message:"Invalid user request required Headers"})
            }

            let buffer = this.dcryptHeader(headers);
            let user = buffer[0];
            // checking in the existence of User;
            return this.validUser(cookies)
                .then((response) => {
                    if (response === user) {
                        return Promise.resolve(response);
                    }
                    else {
                        console.info("[Auth]logout from current user/ enter valid user credentials");
                        return Promise.reject({message:"inValid User"});
                    }
                }).catch((err) => {
                    console.error("[Auth] err in cookies")
                    console.error(err);
                    return Promise.reject(err);
                })
        }
    }

    static dcryptHeader(headers) {
        let buffer = new Buffer.from(headers.split(" ")[1], 'base64')
        buffer = buffer.toString().split(":")
        return buffer
    }

    static validUser(user) {
        return userModel.getUser(user)
            .then((userData) => {
                console.info("[Auth] user data from [validUser]")
                if (!userData) {
                    console.info("[Auth] error in [validuser]")
                    return Promise.reject("[Auth] inValid User");
                }
                return Promise.resolve(user);
            })

    }
}

module.exports = Auth