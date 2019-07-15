const {Card, validate} = require('../models/card');
const cards = require('../routes/cards');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.render('addCard');
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let card = await Card.findOne({ deck: req.body.deck, question: req.body.question });
    if (card) return res.status(400).send('Card with same question already registered in that deck.');

    card = new Card({ 
        deck: req.body.deck,
        question: req.body.question,
        answer: req.body.answer,
        tags: req.body.tags
    });
    card = await card.save();
    console.log(card);

    res.render('addCard');
});

router.put('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let card = await Card.findOne({ question: req.body.question });
    if (!card) return res.status(400).send('That card does not exist');
    console.log(req.body.question);

    Card.findOneAndUpdate(req.body.question, { answer: req.body.answer });
    res.send('Product udpated.');
});
    
module.exports = router;