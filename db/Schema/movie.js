const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
    Name:{
        type:String,

    },
    Rating:{
        type: Number,
    },
    Cast:{
        type:Array,
    },
    Genre:{
        type:String
    },
    ReleaseDate:{
        type:Date,
    }
})


movieSchema.statics.findByName= function(name){
    console.log("in movie model "+ name);
    return this.findOne({Name:name}).then((movie)=>{
        return Promise.resolve(movie);
    })
}

movieSchema.statics.updateCast = function(name,newCast){
    return newCast.map(cast=>{
        this.updateOne({ Name: name }, {$push:{Cast: cast}},(err,docs)=>{
            if(err){
                throw {message:err}
            }
            if(docs.modifiedCount==0){
                throw {message:"unable to update"};
            }
        })
    }).then(()=>{
        return Promise.resolve("updated");
    }).catch(()=>{
        return Promise.reject(err);
    })
}
module.exports = mongoose.model("Movies",movieSchema)