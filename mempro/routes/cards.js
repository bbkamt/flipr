const {Card, validate} = require('../models/card');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', async (req, res) => {
    console.log("body", req.body);
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let card = await Card.findOne({ question: req.body.question });
    if (card) return res.status(400).send('Card with same question already registered.');

    card = new Card({ 
        deck: req.body.deck,
        question: req.body.question,
        answer: req.body.answer,
    });
    card = await card.save();
    console.log(card);

    res.send(card);
});

    
module.exports = router;