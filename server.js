const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const Auth = require('./auth');
const userModel = require('./db/Schema/user');
const movieModel = require('./db/Schema/movie');
const config = require('./db/config.json')

const mongoose = require("mongoose");const { isArray } = require('util');
;


mongoose.connect(config.URL, {
    dbName: config.db,
    useNewUrlParser: true,
}).then(() => {
    console.log("Connected to mongodb....")
}).catch((err => {
    console.log(err);
}))

app.use(cookieParser("1234"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.send("Welcome user please lodin/create account");
    res.end();
})

const authenticate = (req, res, next) => {
    let cookies = req.signedCookies.user;
    let headers = req.headers.authorization;
    let url = req.url;

    console.log("[Authenticate]")
    console.log("cookies;");
    console.log(cookies);
    console.log("url;");
    console.log(url);
    console.log("headers:");
    console.log(headers);
    
    return Auth.isValid(cookies, headers, url)
        .then((data) => {
            console.log("Data from Auth " + data);
            if (data === "NoAuthenticateRequired") {
                res.setHeader("WWW-Authenticate", "Basic")
            }
            if (data !== "NoAuthenticateRequired") {
                console.log(data);
                res.cookie('user', data,{signed:true})

            }
            next();
        }).catch((err) => {
            console.log(err)
            res.setHeader("WWW-Authenticate", "Basic")
            res.status(401).send(err.message);
        })
}


app.post('/register', (req, res) => {

    let { username, email, password } = req.body;



    userModel.getUser(email)
        .then((user) => {
            if (user) {
                throw "User Already Exisited";
            }
            return Promise.resolve(bcrypt.hash(password, 12));
        })
        .then((hashedPswd) => {
            password = hashedPswd;
            console.log(password);
            let newUser = userModel({
                username: username,
                email: email,
                password: password
            })
            console.log("new User    " + newUser);
            newUser.save();
        })
        .then(() => {
            console.log("logging cokkie after registering");
            res.status(200).send("registered sucessfully");
            res.end()
        })
        .catch(errMsg => {
            console.log(errMsg)
            res.status(400).send(errMsg);
            res.end();

        })

})
app.get('/login', (req, res) => {
    const { email, password } = req.body;

    userModel.getUser(email).then((user) => {
        if (!user) {
            throw "user not found";
        }
        console.log(user.password);
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
            console.log(errMsg);
            res.status(400).send(errMsg);
            res.end();
        })


})
app.get("/logout", authenticate, (req, res) => {
    res.clearCookie('user').status(200).send("logged Out!!!");
    console.log("loged Out!!!...");
    res.end();
})

app.post('/addMovie', (req, res) => {
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
        console.log(newMovie);
        return newMovie.save();
    })
        .then(() => {
            res.send("movie Added");
            res.end()
        }).catch(err => {
            console.log(err);
            res.send("unable to add movie " + err.message);
            res.end()
        })


})

app.put('/update/name',authenticate,(req, res) => {
    const { name, newName} = req.body;
    console.log(name + " " + newName);
    if (!newName || newName === "") {
        res.send("invalid new movie name");
        res.end();
    }
    else {
        movieModel.findByName(newName)
            .then((movie) => {
                console.log(movie);
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
                console.log(err);
                res.send("unable to update " + err.message);
                res.end();
            })
    }
})

app.put('/update/rating', authenticate,(req, res) => {
    const { name, newRating} = req.body;
    console.log(name + " " + newRating);
      if (!newRating || newRating === "") {
        res.send("invalid new rating ");
        res.end();
    }
    else {
        movieModel.findByName(name)
            .then((movie) => {
                console.log(movie);
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
                console.log(err);
                res.send("unable to update " + err.message);
                res.end();
            })

    }

})



app.put('/update/genre', (req, res) => {
    const { name, newGenre} = req.body;
    console.log(name + " " + newGenre);
      if (!newGenre || newGenre === "") {
        res.send("invalid new rating ");
        res.end();
    }
    else {
        movieModel.findByName(name)
            .then((movie) => {
                console.log(movie);
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
                console.log(err);
                res.send("unable to update " + err.message);
                res.end();
            })

    }

})

app.put('/update/releaseDate', (req, res) => {
    let { name, newReleaseDate} = req.body;
    newReleaseDate = new Date(newReleaseDate);
    console.log(name + " " + newReleaseDate);
      if (!newReleaseDate || newReleaseDate === "") {
        res.send("invalid new rating ");
        res.end();
    }
    else {
        movieModel.findByName(name)
            .then((movie) => {
                console.log(movie);
                if (movie === null) {
                    throw { message: "movie not found" };
                }
                return Promise.resolve(movieModel.updateOne({ Name: name }, { ReleaseDate: new Date(newReleaseDate) }))
            })
            .then((update) => {
                console.log(update);
                if (update.acknowledged) {
                    res.send("movie  releaseDate updated");
                }
                else {
                    throw { message: "something went wrong" }
                }
                res.end();
            })
            .catch((err) => {
                console.log(err);
                res.send("unable to update " + err.message);
                res.end();
            })

    }

})
app.put('/update/Cast',(req,res)=>{
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
            console.log(movie);
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
app.listen(8080, console.log("server running..."));