
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required:true
    }

})

userSchema.statics.getuser = function(email){
    console.log("email",email);
    return this.findOne({email:email}).then((data)=>{
        console.log(data);
        return Promise.resolve(data);
    })
}

module.exports = mongoose.model("User",userSchema);