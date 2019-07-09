const Joi = require('joi');
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    deck: {
        type: String, 
        required: true
    },
    question: {
        type: String, 
        minlength: 1, 
        maxlength: 500,
        unique: true, 
        required: true
    },
    answer: {
        type: String, 
        minlength: 1, 
        maxlength: 500
    },
    tags: {
        type: String
    },
    new: {
        type: Boolean, 
        default: true
    },
    rating: {
        type: Number, 
        default: 2.5,
        min: 1.3,
    },
    count: {
        type: Number,
        default: 0,
        min: 0 
    },
    correctCount: {
        type: Number, 
        default: 0, 
        min: 0
    },
    dueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    due: {
        type: Boolean, 
        default: true
    }

});

const Card = mongoose.model("Card", cardSchema);

function validateCard(card) {
    const schema = {
        deck: Joi.string(),
        question: Joi.string().min(1).max(500),
        answer: Joi.string().min(1).max(500),
        tags: Joi.string(),
        new: Joi.boolean(),
        rating: Joi.number().default(2.5),
        count: Joi.number().default(0),
        correctCount: Joi.number().default(0),
        dueDate: Joi.date(),
        due: Joi.boolean()
    };
    
    return Joi.validate(card, schema);
}

exports.cardSchema = cardSchema;
exports.Card = Card;
exports.validate = validateCard;