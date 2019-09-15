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

        // find cards to use for multiple choice answers 
        let cards = await Card.aggregate([{ $match: { user: req.user.username} }, { $sample: {size: 3} }]);
        cards.push(card);
        shuffle(cards);
        res.render('multipleChoice', {
            Question: card.question,
            Deck: card.deck,
            ans1: cards[0].answer,
            ans2: cards[1].answer,
            ans3: cards[2].answer,
            ans4: cards[3].answer,
            user: req.user.username
        })
    }
});
        
/*
Post request checks the input answer received from user against the card
and returns the appropriate page (either incorrect or correct)
*/
router.post('/a', async (req, res) => {
    
    // get answer from user input 
    let answer = req.body.answer;
    console.log("answer", answer);

    // find current card 
    let card = await Card.findOne({ user: req.user.username, current: true });
    console.log(card);
    // check if answer matches the card 
    // if correct render page with 3 possible grading options 
    if (card.answer === answer){
        res.render('multipleChoiceCorrect', {
            Question: card.question, 
            Answer: card.answer,
            Deck: card.deck,
            user: req.user.username
        })
    }
    // if incorrect render page with the correct answer and the next button 
    else {
        res.render('multipleChoiceIncorrect', {
            Question: card.question, 
            Answer: card.answer,
            wrongAnswer: answer,
            Deck: card.deck,
            user: req.user.username
        })
    }

});

router.post('/q', async (req, res) => {
    
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

        // find cards to use for multiple choice answers 
        let cards = await Card.aggregate([{$sample: {size: 3}}]);
        console.log(cards.length);
        cards.push(card);
        shuffle(cards);
        res.render('multipleChoice', {
            Question: card.question,
            Deck: card.deck,
            ans1: cards[0].answer,
            ans2: cards[1].answer,
            ans3: cards[2].answer,
            ans4: cards[3].answer,
            user: req.user.username
        })
    }
    
})

module.exports = router;

function shuffle (array) {
    let i = 0;
    let j = 0;
    let temp = null;
  
    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1))
      temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
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