// UserModel.find({email})
    // .then((data)=>{
    //     console.log(data);
    //     if(data.length>0){
    //         throw "user Already exisied";
    //     }
    //     console.log(password);
    //     return bcrypt.hash(password, 12);
    // }).then((hashedPswd)=>{
    //     console.log(hashedPswd);
    //     let user = new UserModel({
    //         username:username,
    //         email:email,
    //         password:hashedPswd
    //     })
    //     user.save();
    // }).then(()=>{
    //     res.status(200).send("new User is registered");
    //     res.end(data).
    //     console.log("new User is registered");
    // }).catch((err)=>{
    //     res.send("unable to create user");
    //     res.end();
    //     console.log(err);
    // })