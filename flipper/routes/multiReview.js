const {Card, validate} = require('../models/card');
const {MultiReview} = require('../models/multiReview');
const ensureAuthenticated = require('./users');
const bodyParser = require('body-parser');
const datetime = require('node-datetime');
const express = require('express');
const passport = require('passport');
const router = express.Router();

// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/*Middleware to authenticate the user for each GET/POST request */
const ensureAuth = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/login");
    }
};
router.use(ensureAuth);

/* 
Post request that will return the question side of a card that 
is due to be reviewed from the deck selected by the user from the decks
page. 
*/
router.get('/', async (req, res) => {
    // Clear any card with 'current' flag set to true
    let c = await Card.updateMany({ user: req.user.username, current: true }, { current: false });
    
    // Get due card 
    let card = await Card.findOne({ user: req.user.username, due: true });
    if (!card) return res.render('finished');
    else {
        // set to current 
        card.current = true; 
        card = await card.save();

        res.render('multiStudyQuestion', {
            Question: card.question,
            Deck: card.deck
        })
    }
});
        
        
router.post('/a', async (req, res) => {
    let card = await Card.findOne({ current: true });
    if (!card) {
        res.render('finished')
    }
    // create multiReview document for user if one doesn't exist
    let mr = await MultiReview.findOne({ 
        username: req.user.username
    });
    console.log(req.user.username);
    if (!mr){
        mr = new MultiReview({
            username: req.user.username
        });
    }
    // save current card as subdocument in multiReview document
    mr.cards.push(card);
    mr = await mr.save();
    card.current = false;
    car = await card.save();
    console.log(mr.cards[0]);

    card.due = false;
    card = await card.save();

    // get next card and display 
    card = await Card.findOne({ user: req.user.username, due: true });
    if (!card) return res.render('finished')

    else {
        card.current = true; 
        card = await card.save();
        res.render('multiStudyQuestion', {
            Question: card.question,
            Deck: card.deck
        })
    }
});


/* 
Get all cards that have been reviewed by user in a multiReview 
and send the array of cards to be rendered by html 
*/
router.get('/review', async (req, res) => {
    let mr = await MultiReview.findOne({ 
        username: req.user.username
    });
    if (!mr) {
        res.render('finished')
    }

    res.render('multiStudyReview', {
        cards: mr.cards
    });
});

module.exports = router;