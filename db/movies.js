
class  Movies{

    constructor(db,col){
        console.log(col)
        this.collection = db.collection(col)
    }
    
    addMovie(newMovie){
        
        return this.collection.insertOne(newMovie).then(data=>{
            if(data.length !==0){
                console.log("data inserted in the movies Collection");
            }
        })
    }
}

module.exports = Movies