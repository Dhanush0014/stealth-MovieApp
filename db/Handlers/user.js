
const bcrypt = require('bcryptjs')


class  User{

    constructor(db,userModel){
        this.userModel = userModel;
       
    }

   addUser(newUser){

        return bcrypt.hash(newUser.password,12)
       .then((hashedPswd)=>{
            newUser.password = hashedPswd
            console.log(newUser);
            return this.userModel.create(newUser)
       }).then((response)=>{
           console.log(response);
           return Promise.resolve("user created successfully");
       }).catch(err=>{
           console.log(err)
           return Promise.reject("unable to create User");

       })
   }

   getUser(email){
    return this.userModel.find({email}).
    then((user)=>{
        if(user.length>0)
        return Promise.resolve(user[0]);
        else
        return Promise.resolve();
    })
    .catch(err=>{
        console.log(err)
        return Promise.reject(err);
    })
   }


    
}

module.exports = User