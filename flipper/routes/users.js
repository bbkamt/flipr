const bcrypt = require('bcrypt');
const express = require('express');
const {User} = require("../models/user");
const router = express.Router();
const passport = require("passport");

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
    res.send(newUser);
    
});
    
router.get("/", async (req, res) => {
    let users = await User.find().sort( {createdAt: -1 });
    if (users){
        res.render("signup", { users: users });
    }
    else return res.status(400).send('No users'); 
});

module.exports = router;