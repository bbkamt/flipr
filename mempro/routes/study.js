const {Card, validate} = require('../models/card');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async (req, res) => {

    let card = await Card.findOne({ due: true });
    if (!card) return res.status(400).send('You\'re up to date! No cards to study today!');

    console.log(card);

    res.render('review', {
        Question: card.question,
        Answer: card.answer
    })
});

module.exports = router;