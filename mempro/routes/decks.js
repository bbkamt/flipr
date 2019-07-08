const {Deck, validate} = require('../models/deck');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let deck = await Deck.findOne({ name: req.body.name });
    if (deck) return res.status(400).send('Deck with same name already exists.');

    deck = new Deck({ 
        userId: req.body.userId,
        name: req.body.name,
    });
    deck = await deck.save();

    res.send(deck);
});

module.exports = router; 