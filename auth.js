const userModel = require('./db/Schema/user')
const bcrypt = require('bcryptjs');

class Auth {

    static isValid(cookies, headers, url) {

        if (!cookies) {
            if (!headers || (url === "login" || url === "/register")) {
                return Promise.resolve("NoAuthenticateRequired");
            }
            else if (url === "/logout") {
                //if suppose rying to logout without login
                return Promise.reject({ message: "user not loged in" });
            }
            else {
                let buffer = this.dcryptHeader(headers);
                let user = buffer[0];
                let password = buffer[1];
                return userModel.getUser(user)
                    .then((userData) => {
                        if (!userData) {
                            console.log("invalid User because user data not found");
                            return Promise.reject({message:"inValid User"});
                        }
                        return bcrypt.hash(password, 12);
                    })
                    .then(hashedPswd => {
                        return bcrypt.compare(password, hashedPswd);
                    }).then(valid => {
                        if (valid) {
                            console.log('[no cookies]');
                            console.log("Adding Cookies....")
                            return Promise.resolve(user);
                        }
                        console.log("invalid user because password did not match");
                        return Promise.reject({message:"inValid User"});
                    }).catch((err) => {
                        console.log("error in no cookies");
                        console.log(err);
                        return Promise.reject(err);
                    })
            }
        }
        else {

            let buffer = this.dcryptHeader(headers);
            let user = buffer[0];

            // checking in the existence of User;
            return this.validUser(cookies)
                .then((response) => {
                    if (response === user) {
                        return Promise.resolve(response);
                    }
                    else {
                        console.log("logout from current user/ enter valid user credentials");
                        return Promise.reject({message:"inValid User"});
                    }
                }).catch((err) => {
                    console.log("err in cookies")
                    console.log(err);
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
                console.log("user data from [validUser]")
                if (!userData) {
                    console.log("error in [validuser]")
                    return Promise.reject("inValid User");
                }
                return Promise.resolve(user);
            })

    }
}

module.exports = Auth