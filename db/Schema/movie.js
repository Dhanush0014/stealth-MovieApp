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
   
    return this.findOne({Name:name}).then((movie)=>{
        return Promise.resolve(movie);
    })
}


module.exports = mongoose.model("Movies",movieSchema)