const {Card, validate} = require('../models/card');

const bodyParser = require('body-parser');
const datetime = require('node-datetime');
const express = require('express');
const router = express.Router();

// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async (req, res) => {

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

router.post('/decks', async (req, res) => {
    console.log(req.body.deck);
    let card = await Card.findOne({ deck: req.body.deck, due: true });
    if (!card) return res.render('finished')
    else {
        card.current = true; 
        card = await card.save();
        console.log(req.body);
        res.render('study', {
            Answer: card.answer,
            Question: card.question,
            Deck: card.deck
        })
    }
})


router.post('/decks/answer', async (req, res) => {
    console.log(req.body.deck);
    let card = await Card.findOne({ deck: req.body.deck, due: true });
    if (!card) return res.render('finished')
    else {
        card.current = true; 
        card = await card.save();
        console.log(req.body);
        res.render('study', {
            Question: card.question,
            Answer: card.answer,
            Deck: card.deck
        })
    }
})

router.post('/', async (req, res) => {
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);
    let card = await Card.findOne({ current: true });
    if (!card) {
        res.render('finished')
    }
    console.log(req.body);
    let q = req.body.difficulty;
    console.log(q);

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

    // get next card 
    card = await Card.findOne({ deck: card.deck, due: true });
    if (!card) return res.render('finished')

    else {
        card.current = true; 
        card = await card.save();
        res.render('study', {
            Question: card.question,
            Answer: card.answer
        })
    }
});

module.exports = router;

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
    let date = parseInt(datetime.create().format('Ymd'));
        date+= card.interval;
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