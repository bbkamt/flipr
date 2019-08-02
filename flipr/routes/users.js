const bcrypt = require('bcrypt');
const express = require('express');
const {User} = require("../models/user");
const router = express.Router();
const passport = require("passport");

router.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get('/', async (req, res) => {
    res.render("signup");
})

/*
POST request to register a new user with a hashed password. 
*/
router.post('/', async (req, res) => {
    console.log("here!");

    // User details
    const username = req.body.username; 
    const password = req.body.password;
    const email = req.body.email;

    // Check for any users with same username/password 
    let user = await User.findOne({ username: username }); 
    if (user) return res.status(400).send("User with that name already exists");
    user = await User.findOne({ email: email });
    if (user) return res.status(400).send("An account with that email address is already registered.");

    // create new user and save 
    let newUser = new User({
        username: username, 
        password: password,
        email: email
    });

    newUser = await newUser.save();
    res.render('decks', {
        deck: ["You don't have any decks yet. Please create some cards to get started."]
    });
    
});

/*
POST request for login. 
Authentication is performed by passport module. 
Redirect to appropriate route based on result of authentication. 
*/ 
router.post('/login', passport.authenticate('login', {
    successRedirect: "/api/decks",
    failureRedirect: '/api/signup', 
    failureFlash: true
}));

/*
Logout 
*/
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

router.post('/user', async (req, res) => {
    // User details
    const username = req.body.username; 
    const password = req.body.password;

    let user = await User.findOne({ username: username });
    if (!user) res.redirect('/');
    else {
        bcrypt.compare(password, user.password, function(err, result){
            if (result == true) {
                res.send("Success");
            }
            else {
                res.send("Incorrect password");
            }
        })
    }
})
    
router.get("/", async (req, res) => {
    let users = await User.find().sort( { createdAt: -1 });
    if (users){
        res.render("signup", { users: users });
    }
    else return res.status(400).send('No users'); 
});


let ensureAuth = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/");
        next();
    }
};

exports.ensureAuthenticated = ensureAuth;
module.exports = router;

