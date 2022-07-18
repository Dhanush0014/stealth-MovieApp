const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const Auth = require('./auth');
const userModel = require('./db/Schema/user')
const Connector = require('./db/Connector');
const config = require('./db/config.json')

const mongoose = require("mongoose");;


// Connector.getInstance().connect();

mongoose.connect(config.URL, {
    dbName: config.db,
    useNewUrlParser: true,
}).then(() => {
    console.log("Connected to mongodb....")
})

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.send("Welcome user please lodin/create account");
    res.end();
})

const authenticate = (req, res, next) => {
    let cookies = req.cookies.user;
    let headers = req.headers.authorization;
    let url = req.url;

    console.log("[Authenticate]")
    console.log("cookies;");
    console.log(cookies);
    console.log("url;");
    console.log(url);
    console.log("headers:");
    console.log(headers);

    if (url === "logout") {
        return next();
    }
    return Auth.isValid(cookies, headers, url)
        .then((data) => {
            console.log("Data from Auth " + data);
            if (data === "NoAuthorizationRequired") {
                res.setHeader("WWW-Authenticate", "Basic")

            }
            if (data !== "NoAuthorizationRequired") {
                res.cookie('user', data)

            }
            next();
        }).catch((err) => {
            console.log(err)
            res.status(401).send("Unauthorized")
        })
}


app.post('/register', (req, res) => {

    const { username, email, password } = req.body;

    let newUser = {
        username: username,
        email: email,
        password: password
    }

    Connector.getInstance().user.getUser(email)
        .then((user) => {
            console.log(user);
            if (user) {
                throw "User Already Exisited";
            }
            return Connector.getInstance().user.addUser(newUser)
        })
        .then((notification) => {
            console.log("logging cokkie after registering");
            cosole.log(res.cookie);
            res.status(200).send(notification);
            res.end()
            console.log(notification);
        })
        .catch(errMsg => {
            console.log(errMsg)
            res.status(400).send(errMsg);
            res.end();

        })

})
app.get('/login', (req, res) => {
    const { email, password } = req.body;

    userModel.getuser(email).then((user) => {
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

    // Connector.getInstance().user.getuser(email).then(data=>{
    //     if(data){
    //         console.log("user found");
    //     }
    // }).catch(err=>{
    //     co
    // })
    // Connector.getInstance().user.getUser(email)
    //     .then((user) => {
    //         if (!user) {
    //             throw "user not found";
    //         }
    //         console.log(user.password);
    //         return bcrypt.compare(password, user.password);
    //     })
    //     .then((pswdMatch) => {
    //         if (!pswdMatch) {
    //             throw "invalid password";
    //         }
    //         return "login successfull!!!"
    //     })
    //     .then((notification) => {
    //         res.status(200).send(notification);
    //         res.end();
    //     })
    //     .catch(errMsg => {
    //         console.log(errMsg);
    //         res.status(400).send(errMsg);
    //         res.end();
    //     })
})
app.get("/logout", authenticate, (req, res) => {
    res.clearCookie('user').status(200).send("logged Out!!!");
    console.log("loged Out!!!...");
    res.end();
})

app.post('/add', authenticate, (req, res) => {
    const { name, rating, cast, genre, releaseDate } = req.body;
    let newMovie = {
        name: name,
        rating: rating,
        cast: cast,
        genre: genre,
        realeaseDate: new Date(releaseDate)
    }
    // dbConnector.getInstance().movies.addMovie(newMovie)
    res.send("movie Added");
    res.end();
})
app.listen(8080, console.log("server running..."));