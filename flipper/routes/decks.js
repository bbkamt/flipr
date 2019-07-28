const {Card} = require('../models/card');
const {Deck, validate} = require('../models/deck');
const decks = require('../routes/decks');
const {ensureAuthenticated} = require('./users');
const mongoose = require('mongoose');
const datetime = require('node-datetime');
const express = require('express');
const router = express.Router();

/*Middleware to authenticate the user for each GET/POST request */
const ensureAuth = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/");
    }
};
router.use(ensureAuth);

/*
GET request that returns a list of all decks owned by user.
Updates the due dates for all cards in each deck. 
*/
router.get('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    updateAllDue();

    let decks = await Deck.find({ username: req.user.username }).sort({ name: 1 });
    if (!decks) return res.status(400).send('You don\'t have any decks. Create one and try again.');
    
    res.render('decks', {
        deck: decks
    });
});

/* 
POST request to create a new deck. 
*** DECK CREATION HANDLED UNDER CARDS.JS ROUTE WHEN NEW CARD CREATED *** 
*/
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let deck = await Deck.findOne({ name: req.body.name });
    if (deck) return res.status(400).send('Deck with same name already exists.');

    console.log(req.user);
    deck = new Deck({ 
        userId: req.body.userId,
        user: req.user,
        username: req.body.name,
    });
    deck = await deck.save();

    res.send(deck);
});

/*
Function to check all cards that are not due against today's date and update any that are due.
*/
async function updateAllDue(){
    const date = parseInt(datetime.create().format('Ymd'));
    const res = await Card.updateMany({ due: false, dueDate: {$lte: date } }, { due: true });
}



module.exports = router; 