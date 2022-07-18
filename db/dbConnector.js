

const MongoClient = require('mongodb').MongoClient;
const Movies = require('./movies') 

const URL ="mongodb+srv://Dhanush:Dhanush000@cluster0.rlqlc1j.mongodb.net/?retryWrites=true&w=majority";

class dbConnector{
    constructor(){
        this.mongoClient = null
        this.mongoDB = null
    }
    static getInstance(){
        if(!dbConnector.instance){
            dbConnector.instance = new dbConnector
        }
        return dbConnector.instance
    }

    connect(){
        if (this.mongoDB) {
            return Promise.resolve(this.mongoDB);
        }

        return MongoClient.connect(URL,{
            "useNewUrlParser": true,
            "useUnifiedTopology": true
        }).then(mongoClient=>{
            this.mongoClient = mongoClient;
            this.mongoDB = this.mongoClient.db("stealth")
            console.log("connected to mongo Client");
            return this.mongoDB
        }).then(mongoDB=>{
            this.movies =  new Movies(mongoDB,'movies');
        })
    }
}

module.exports = dbConnector