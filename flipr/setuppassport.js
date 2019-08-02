const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const passport = require("passport");
const {User} = require("./models/user");

async function checkPassword(password){
    const salt = await bcrypt.genSalt(10);
    pw = await bcrypt.hash(password, salt);
    return pw;
  }

passport.use('login', new LocalStrategy(
    async function(username, password, done) {
    
        let user = await User.findOne({ username: username })
        if (!user) { 
            return done(null, false,
                { message: "No user with that username!" }); }
        
        const isPassword = await checkPassword(password, user.password);
        if (!isPassword){
            console.log("invalid pw");
            return done(null, false, 
                { message: "Invalid password." });
        }
        return done(null, user);
    }));

module.exports = function() {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
        done(err, user);
        });
    });
};