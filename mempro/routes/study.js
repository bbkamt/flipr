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
    if (!card) return res.render('finished')
    else {
        res.render('study', {
            Question: card.question,
            Answer: card.answer
        })
    }
});

/*
put updates card 
NOTE: needs data of card being studied and answers from user 
q
d 
*/ 
router.post('/', async (req, res) => {

    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);
    
    let card = await Card.findOne({ due: true });
    if (!card) {
        res.render('finished')
    }
    

    let q = req.body.difficulty;
    console.log(q);

    if (card.new === true) {
        console.log("new");
        // set new difficult based off user decision 
        card.difficulty = card.difficulty + (0.1-(3-q) * (0.08+(3-q) * 0.02));
        if (card.difficulty < 1.3) {
            card.difficulty = 1.3;
        }
        
        // set interval between next repetition 
        if (card.count === 0){
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

        if (q === 0) card.due = true;
        else card.due = false; 
        
        // update dueDate 
        let date = datetime.create();
        date.offsetInDays(card.interval);
        card.dueDate = date;

        if (q != 0) {
            card.correctCount++;
        }
        else {
            card.correctCount = 0;
        }
    }

    
    // if card not new update as follows 
    else {
        console.log("old");
         // set new difficult based off user decision 
         card.difficulty = card.difficulty + (0.1-(3-q) * (0.08+(3-q) * 0.02));
         if (card.difficulty < 1.3) {
             card.difficulty = 1.3;
         }
        
         // set interval between next repetition 
         if (card.count === 0){
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
         if (q == 0) {
            card.due = true;
         } 
         else {
            card.due = false; 
         } 
         
         // update dueDate 
         let date = datetime.create();
         date.offsetInDays(card.interval);
         card.dueDate = date;
 
         if (q != 0) {
             card.correctCount++;
         }
         else {
             card.correctCount = 0;
         }
    }
    card = await card.save();
    console.log(card);

    // get next card 
    card = await Card.findOne({ due: true });
    if (!card) return res.render('finished')

    else {
        res.render('study', {
            Question: card.question,
            Answer: card.answer
        })
    }
});

module.exports = router;