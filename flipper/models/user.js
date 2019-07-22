const bcrypt = require('bcrypt');
//const config = require('config');
//const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
      type: String, 
      required: true, 
      unique: true,
      minlength: 5, 
      maxlength: 255 
  },
  password: {
      type: String, 
      required: true, 
      minlength: 5, 
      maxlength: 1024, 
  }, 
  createdAt: {
    type: Date, 
    required: true, 
    default: Date.now
  }
});

/*
Function to generate salt and hash password whenever a 
new user account is created. 
*/ 
var SALT_FACTOR = 10;
userSchema.pre('save', async function() {
  var user = this;
  if (!user.isModified('password')){
    return; 
  }
  const salt = await bcrypt.genSalt(SALT_FACTOR);
  user.password = await bcrypt.hash(user.password, salt);
});

function hashPassword(password){
  const salt = bcrypt.genSalt(SALT_FACTOR);
  pw = bcrypt.hash(password, salt);
  return pw;
}

// userSchema.methods.checkPassword = function(guess, done) {
//   bcrypt.compare(guess, this.password, function(err, isMatch){
//     done(err, isMatch);
//   });
// };

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, function(err, isMatch) {
  done(err, isMatch);
  });
};



// attach schema to model 
const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(50).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
}



// export 
exports.User = User; 
exports.validate = validateUser;
exports.hashPassword = hashPassword;
// exports.checkPassword = checkPassword;