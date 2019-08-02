/*
Flow of requests 
i) User is decks page, selects deck to study and POST /api/study/q is called
ii) User is shown question of card, clicks to reveal answer and POST /api/study/decks is called
iii) User is shown question, answer, and buttons to rate card, and POST /api/study/a is called
*/

const {Card, validate} = require('../models/card');
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
router.post('/q', async (req, res) => {
    // Clear any card with 'current' flag set to true
    let c = await Card.updateMany({ user: req.user.username, current: true }, { current: false });
    console.log(req.user.username);
    let card = await Card.find({ user: req.user.username, deck: req.body.deck, due: true });
    if (card.length === 0) return res.render('finished')
    else {
        let index = Math.floor((Math.random() * card.length) + 1)-1;
        card = card[index];
        card.current = true; 
        card = await card.save();
       
        res.render('studyQuestion', {
            Question: card.question,
            Deck: card.deck
        })
    }
})

/* 
Post request that updates the card being reviewed with the 
information provided by the user (difficulty rating 0-4). Saves
the updated information and returns the next card due to be reviewed.
*/
router.post('/a', async (req, res) => {
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);
    let card = await Card.findOne({ current: true });
    if (!card) {
        res.render('finished')
    }
    
    let q = req.body.difficulty;
    

    setDifficulty(card, q);
    setInterval(card);
    setDueDate(card);
    setCorrectCount(card, q);
    setCount(card);
    setNew(card);
    setDue(card, q);
    setCurrent(card);
    
    card = await card.save();
    console.log(card);

    // get next card and display 
    card = await Card.find({ user: req.user.username, deck: card.deck, due: true });
    if (card.length === 0) return res.render('finished')
    else {
   
        let index = Math.floor((Math.random() * card.length) + 1)-1;
      
        card = card[index];
 
        card.current = true; 
        card = await card.save();
        res.render('studyQuestion', {
            Question: card.question,
            Deck: card.deck
        })
    }
});


/* 
Post request which returns the question and answer side of the 
card being reviewed to the browser. 
*/
router.post('/decks', async (req, res) => {

    let card = await Card.findOne({ user: req.user.username, deck: req.body.deck, current: true });
    if (!card) return res.render('finished')
    else {
        card.current = true; 
        card = await card.save();

        res.render('study', {
            Answer: card.answer,
            Question: card.question,
            Deck: card.deck
        })
    }
})


/* 
Get request - not currently in use. 
*/
router.get('/', async (req, res) => {
    
    // Move this function call to a separate button on decks page 
    updateAllDue();

    let card = await Card.findOne({ due: true });
    if (!card) return res.render('finished')
    else {
        card.current = true; 
        card = await card.save();
        console.log(req.body);
        res.render('study', {
            Question: card.question,
            Answer: card.answer
        })
    }
});


module.exports = router;


/* 
All functions used to update card information. 
*/

async function updateAllDue(){
    const date = parseInt(datetime.create().format('Ymd'));
    const res = await Card.updateMany({ due: false, dueDate: {$lt: date } }, { due: true });
}

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