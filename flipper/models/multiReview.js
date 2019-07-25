const mongoose = require('mongoose');
const {cardSchema} = require('../models/card');

const multiReviewSchema = new mongoose.Schema({
    username: {
        type: String
    },
    cards: [cardSchema]
});

const MultiReview = mongoose.model("MultiReview", multiReviewSchema);

exports.multiReviewSchema = multiReviewSchema;
exports.MultiReview = MultiReview;
