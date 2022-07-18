const mongoose = require("mongoose");
const User = require("./Handlers/user");
const UserModel = require("./Schema/user")
const config = require('./config.json')
const URL = "mongodb+srv://Dhanush:Dhanush000@cluster0.rlqlc1j.mongodb.net/?retryWrites=true&w=majority";

class Connector{
    
    constructor(){
        this.mongoClient = null
        this.mongoDB = null
    }
    static getInstance(){
        if(!Connector.instance){
            Connector.instance = new Connector
        }
        return Connector.instance
    }
    connect(){
        mongoose.connect(config.URL,{
            dbName:config.db,
            useNewUrlParser:true,
        }).
        then((mongoClient)=>{
             this.mongoClient = mongoClient;
            this.mongoDB = mongoClient.connection.name
            console.log("connected to mongo Client....");
            return this.mongoDB
        })
        .then((mongoDB)=>{
            this.user = new UserModel();
        })
        .catch(err=>{
            console.log(err);
            
        })
    }


}

module.exports = Connector
