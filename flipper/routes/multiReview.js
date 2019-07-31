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
router.post('/', async (req, res) => {
    // Clear any card with 'current' flag set to true
    let c = await Card.updateMany({ user: req.user.username, current: true }, { current: false });
    
    // Get due card 
    let card = await Card.findOne({ user: req.user.username, deck: req.body.deck, due: true });
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
        res.render('finished');
    };
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
    card = await Card.findOne({ user: req.user.username, deck: card.deck, due: true });
    if (!card) {
        let mr = await MultiReview.findOne({ 
            username: req.user.username
        });
        console.log(mr);
        if (mr) {
            res.render('multiStudyReview', {
                cards: mr.cards
            });
        }
        else {
            return res.render('finished')
        }
    }

    else {
        card.current = true; 
        card = await card.save();
        res.render('multiStudyQuestion', {
            Question: card.question,
            Deck: card.deck
        })
    }
});

router.post('/q', async (req, res) => {
    
    // get array of review scores 
    let scores = req.body.difficulty;
    console.log(scores);

    // get array of cards that have been reviewed 
    let mr = await MultiReview.findOne({ 
        username: req.user.username
    });
    let cards = mr.cards;
    console.log(cards.length);

    for (card in cards){
        let q = scores[card];
        console.log(cards[card].question);
        let c = await Card.findOne({user: req.user.username, question: cards[card].question});
        if (!c) break; 
        console.log(q);
        setDifficulty(c, q);
        setInterval(c);
        setDueDate(c);
        setCorrectCount(c, q);
        setCount(c);
        setNew(c);
        setDue(c, q);
        setCurrent(c);
    
        c = await c.save();
    }

    mr = await MultiReview.deleteOne({ username: req.user.username });

    res.render('finished')
})

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
    };

    res.render('multiStudyReview', {
        cards: mr.cards
    });
});

module.exports = router;


function setDifficulty(card, q) {
    card.difficulty = card.difficulty + (0.1-(3-q) * (0.08+(3-q) * 0.02));
    if (card.difficulty < 1.3) {
        card.difficulty = 1.3;
    }
}

function setInterval(card){
    if (card.count === 0){
        card.interval = 1;
    }
    else if (card.count === 1) {
        card.interval = 6;
    }
    else {
        card.interval = (card.count-1) * (card.difficulty * card.correctCount);
    }
}

function setDueDate(card){
    let date = datetime.create();
    date.offsetInDays(card.interval);
    date = parseInt(date.format('Ymd'));
    card.dueDate = date;
}

function setCorrectCount(card, q){
    if (q != 0) {
        card.correctCount++;
    }
    else {
        card.correctCount = 0;
    }
}

function setCount(card){
    card.count++;
}

function setNew(card){
    if (card.new = true) {
        card.new = false;
    }
}

function setDue(card, q){
    if (q == 0) card.due = true;
    else card.due = false; 
}

function setCurrent(card){
    card.current = false;
}