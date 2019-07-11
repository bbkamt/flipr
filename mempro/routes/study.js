const {Card, validate} = require('../models/card');

const bodyParser = require('body-parser');
const datetime = require('node-datetime');
const express = require('express');
const router = express.Router();

// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    let card = await Card.findOne({ due: true });
    if (!card) return res.status(400).send('You\'re up to date! No cards to study today!');

    console.log(card);

    res.render('study', {
        Question: card.question,
        Answer: card.answer
    })
});

/*
put updates card 
NOTE: needs data of card being studied and answers from user 
q
d 
*/ 
router.post('/', async (req, res) => {
    console.log("here");
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let card = await Card.findOne({ due: true });
    if (!card) return res.status(400).send('No more cards due! You\'re up to date!');
    console.log(card);

    if (card.new === true) {
        
        // set new difficult based off user decision 
        card.difficulty = card.difficulty + (0.1-(3-2) * (0.08+(3-2) * 0.02));
        
        // set interval between next repetition 
        if (1 === 0){
            card.interval = 1;
        }
        else if (card.count === 1) {
            card.interval = 6;
        }
        else {
            card.interval = (card.count-1) * (card.difficulty * card.correctCount);
        }

        // update remaining fields 
        card.count++;
        card.new = false;
        card.due = false; 
        
        // update dueDate 
        let date = datetime.create();
        date.offsetInDays(card.interval);
        card.dueDate = date;

        if (1 != 0) card.correctCount++;
        else card.correctCount = 0;
        
    }

    // if card not new update as follows 
    else {
         // set new difficult based off user decision 
         card.difficulty = card.difficulty + (0.1-(3-2) * (0.08+(3-2) * 0.02));
        
         // set interval between next repetition 
         if (1 === 0){
             card.interval = 1;
         }
         else if (card.count === 1) {
             card.interval = 6;
         }
         else {
             card.interval = (card.count-1) * (card.difficulty * card.correctCount);
         }
 
         // update remaining fields 
         card.count++;
         card.due = false; 
         
         // update dueDate 
         let date = datetime.create();
         date.offsetInDays(card.interval);
         card.dueDate = date;
 
         if (1 != 0) card.correctCount++;
         else card.correctCount = 0;
    }
    
    card = await card.save();
    console.log(card);

    // get next card 
    card = await Card.findOne({ due: true });
    if (!card) return res.status(400).send('You\'re up to date! No cards to study today!');

    res.render('study', {
        Question: card.question,
        Answer: card.answer
    })
});

module.exports = router;