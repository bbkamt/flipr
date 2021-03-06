const Joi = require('joi');
const mongoose = require('mongoose');
const {card} = require('./card');

const Deck = mongoose.model('Deck', new mongoose.Schema({
   userId: {
       type: String, 
       minlength: 1,
       maxlength: 50
   },
   username: {
       type: String
   },
   name: {
       type: String, 
       required: true,
       minlength: 1,
       maxlength: 50
   },
   cardsNumber: {
       type: Number,
       min: 0
   },
}));

function validateDeck(Deck) {
    const schema = {
        userId: Joi.string().min(1).max(50),
        name: Joi.string().min(1).max(50),
        cardsNumber: Joi.number()
    };
    
    return Joi.validate(Deck, schema);
}

exports.Deck = Deck;
exports.validate = validateDeck;