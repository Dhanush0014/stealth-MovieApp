const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const Auth = require('./auth');
const userModel = require('./db/Schema/user');
const movieModel = require('./db/Schema/movie');
const config = require('./db/config.json')
const logger = require('./utils/winston');
const mongoose = require("mongoose");const { isArray } = require('util');

const port = 8080;
mongoose.connect(config.URL, {
    dbName: config.db,
    useNewUrlParser: true,
}).then(() => {
    logger.info("Connected to mongodb....")
}).catch((err => {
    logger.error(err);
}))

app.use(cookieParser("1234"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    logger.info("In Home page");
    res.send("Welcome user please login/create account");
    res.end();
})

const authenticate = (req, res, next) => {
    let cookies = req.signedCookies.user;
    let headers = req.headers.authorization;
    let url = req.url;

    logger.info("[Authenticate]")
    logger.info("cookies;");
    logger.info(cookies);
    logger.info("url;");
    logger.info(url);
    logger.info("headers:");
    logger.info(headers);
    
    return Auth.isValid(cookies, headers, url)
        .then((data) => {
            logger.info("Data from Auth " + data);
            if (data === "NoAuthenticateRequired") {
                //for first time login in, in our case add movie 
                res.setHeader("WWW-Authenticate", "Basic")
            }
            if (data !== "NoAuthenticateRequired") {
                logger.info(data);
                res.cookie('user', data,{signed:true})
            }
            next();
        }).catch((err) => {
            console.error(err)
            res.setHeader("WWW-Authenticate", "Basic")
            res.status(401).send(err.message);
        })
}


app.post('/register', (req, res) => {
    let { username, email, password } = req.body;
    if(username.length === 0||email.length===0||password.length===0){
        res.send("Enter valid user details");
    }
    else{
        userModel.getUser(email)
        .then((user) => {
            if (user) {
                throw "User Already Exisited";
            }
            return Promise.resolve(bcrypt.hash(password, 12));
        })
        .then((hashedPswd) => {
            password = hashedPswd;
          
            let newUser = userModel({
                username: username,
                email: email,
                password: password
            })
            logger.info("new User    " + newUser);
            return newUser.save();
        })
        .then((data) => {
            if(data){
                res.status(200).send("registered sucessfully");
                res.end()
            }
             else{
                 logger.info(data);
                 throw {message:"something went wrong"};
             }
        })
        .catch(err => {
            logger.error(err)
            res.status(400).send(err.message);
            res.end();

        })

    }
   
})

app.get('/login', authenticate,(req, res) => {
    const { email, password } = req.body;

    userModel.getUser(email).then((user) => {
        if (!user) {
            throw "user not found";
        }
        logger.info(user.password);
        return bcrypt.compare(password, user.password);
    })
        .then((pswdMatch) => {
            if (!pswdMatch) {
                throw "invalid password";
            }
            return "login successfull!!!"
        })
        .then((notification) => {
            res.status(200).send(notification);
            res.end();
        })
        .catch(errMsg => {
            logger.error(errMsg);
            res.status(400).send(errMsg);
            res.end();
        })


})

app.get("/logout", authenticate, (req, res) => {
    res.clearCookie('user').status(200).send("logged Out!!!");
    logger.info("loged Out!!!...");
    res.end();
})

app.post('/addMovie',authenticate, (req, res) => {
    const { name, rating, cast, genre, releaseDate } = req.body;
    movieModel.findByName(name).then((movie) => {
        if (movie) {
            throw { message: "movie already added" };
        }
        let newMovie = movieModel({
            Name: name,
            Rating: rating,
            Cast: cast,
            Genre: genre,
            ReleaseDate: new Date(releaseDate)
        })
        logger.info(newMovie);
        return newMovie.save();
    })
        .then(() => {
            res.send("movie Added");
            res.end()
        }).catch(err => {
            logger.error(err);
            res.send("unable to add movie " + err.message);
            res.end()
        })
})

app.put('/update/name',authenticate,(req, res) => {
    const { name, newName} = req.body;
    logger.info(name + " " + newName);
    if (!newName || newName === "") {
        res.send("invalid new movie name");
        res.end();
    }
    else {
        movieModel.findByName(newName)
            .then((movie) => {
                logger.info("Exisiting Movie data");
                logger.info(movie);
                if (movie !== null) {
                    throw { message: "new movie name already exisited" };
                }
                return Promise.resolve(movieModel.updateOne({ Name: name }, { Name: newName }))
            })
            .then((update) => {
                if (update.acknowledged && update.modifiedCount !== 0) {
                    res.send("movie name updated");
                }
                else {
                    throw { message: "something went wrong" }
                }
                res.end();
            })
            .catch((err) => {
                logger.error(err);
                res.send("unable to update " + err.message);
                res.end();
            })
    }
})

app.put('/update/rating', authenticate,(req, res) => {
    const { name, newRating} = req.body;
    logger.info(name + " " + newRating);
      if (!newRating || newRating === "") {
        res.send("invalid new rating ");
        res.end();
    }
    else {
        movieModel.findByName(name)
            .then((movie) => {
                logger.info(movie);
                if (movie === null) {
                    throw { message: "movie not found" };
                }
                return Promise.resolve(movieModel.updateOne({ Name: name }, { Rating: newRating }))
            })
            .then((update) => {
                if (update.acknowledged && update.modifiedCount !== 0) {
                    res.send("movie  rating updated");
                }
                else {
                    throw { message: "something went wrong" }
                }
                res.end();
            })
            .catch((err) => {
                console.error(err);
                res.send("unable to update " + err.message);
                res.end();
            })

    }

})

app.put('/update/genre',authenticate, (req, res) => {
    const { name, newGenre} = req.body;
    logger.info(name + " " + newGenre);
      if (!newGenre || newGenre === "") {
        res.send("invalid new rating ");
        res.end();
    }
    else {
        movieModel.findByName(name)
            .then((movie) => {
                logger.info(movie);
                if (movie === null) {
                    throw { message: "movie not found" };
                }
                return Promise.resolve(movieModel.updateOne({ Name: name }, { Genre: newGenre }))
            })
            .then((update) => {
                if (update.acknowledged && update.modifiedCount !== 0) {
                    res.send("movie  genre updated");
                }
                else {
                    throw { message: "something went wrong" }
                }
                res.end();
            })
            .catch((err) => {
                logger.error(err);
                res.send("unable to update " + err.message);
                res.end();
            })

    }

})

app.put('/update/releaseDate',authenticate, (req, res) => {
    let { name, newReleaseDate} = req.body;
    newReleaseDate = new Date(newReleaseDate);
    logger.info(name + " " + newReleaseDate);
      if (!newReleaseDate || newReleaseDate === "") {
        res.send("invalid new rating ");
        res.end();
    }
    else {
        movieModel.findByName(name)
            .then((movie) => {
                logger.info(movie);
                if (movie === null) {
                    throw { message: "movie not found" };
                }
                return Promise.resolve(movieModel.updateOne({ Name: name }, { ReleaseDate: new Date(newReleaseDate) }))
            })
            .then((update) => {
                logger.info(update);
                if (update.acknowledged) {
                    res.send("movie  releaseDate updated");
                }
                else {
                    throw { message: "something went wrong" }
                }
                res.end();
            })
            .catch((err) => {
                logger.error(err);
                res.send("unable to update " + err.message);
                res.end();
            })

    }

})

app.put('/update/Cast',authenticate,(req,res)=>{
    let {name, newCast} = req.body;

    if (!newCast ||  newCast.length == ""|| newCast ===[]) {
        res.send("invalid new cast ");
        res.end();
    }else{
        if(!Array.isArray(newCast)){
            newCast = [newCast]
        }
        movieModel.findByName(name)
        .then((movie) => {
            logger.info(movie);
            if (movie === null) {
                throw { message: "movie not found" };
            }
            newCast.map(cast=>{
                movieModel.updateOne({ Name: name }, {$push:{Cast: cast}},(err,docs)=>{
                    if(err){
                        throw {message:err}
                    }
                    if(docs.modifiedCount==0){
                        throw {message:"unable to update"};
                    }
                })
            })
        }).then(()=>{
            res.status(200).send("updated..");
            res.end();
        }).catch((err)=>{
            res.send(err.message);
            res.end();
        })

    }
})

app.put('/deleteMovie',authenticate,(req,res)=>{
    const{name} = req.body;
    movieModel.findByName(name)
    .then((movie)=>{
        if(movie===null){
            return Promise.reject({message:"Enter valid Movie name"});
        }
        return movieModel.deleteOne({Name:name});
    }).then((response)=>{
        if(response.acknowledged){
            res.status(200).send("movie deleted Successfully");
            res.end();
        }
        else{
            throw { message: "movie not deleted" }
        }
    }).catch((err)=>{
        res.status(400).send(err.message);
        res.end();
    })
})

app.listen(process.env.PORT ||port, console.log(`🚀 Server ready at https://localhost:${port}`));