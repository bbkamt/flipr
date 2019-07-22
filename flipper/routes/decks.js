const {Card} = require('../models/card');
const {Deck, validate} = require('../models/deck');
const decks = require('../routes/decks');
const mongoose = require('mongoose');
const datetime = require('node-datetime');
const express = require('express');
const router = express.Router();


const a = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/login");
    }
};

router.use(a);

router.get('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    console.log(req.user);
    updateAllDue();

    let decks = await Deck.find({ user: req.user.username }).sort({ name: 1 });
    if (!decks) return res.status(400).send('You don\'t have any decks. Create one and try again.');
    
    res.render('decks', {
        deck: decks
    });
});


router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let deck = await Deck.findOne({ name: req.body.name });
    if (deck) return res.status(400).send('Deck with same name already exists.');

    console.log(req.user);
    deck = new Deck({ 
        userId: req.body.userId,
        user: req.user,
        name: req.body.name,
    });
    deck = await deck.save();

    res.send(deck);
});

async function updateAllDue(){
    const date = parseInt(datetime.create().format('Ymd'));
    const res = await Card.updateMany({ due: false, dueDate: {$lte: date } }, { due: true });
}

module.exports = router; 