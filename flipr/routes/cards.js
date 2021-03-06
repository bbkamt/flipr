const {Card, validate} = require('../models/card');
const {Deck, deckValidate} = require('../models/deck');
const ensureAuthenticated = require('./users');
const cards = require('../routes/cards');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv').config();

const fileUpload = require('express-fileupload');
router.use(fileUpload());
const AWS = require('aws-sdk');

// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

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

router.get('/', (req, res) => {
    res.render('addCard', {
        user: req.user.username
    });
})

/*
POST request to add card.
Checks that no card with that question already exists in the nominated deck owned by the user, 
and creates card. 
If no deck exists with specified name, a new deck is created. 
*/
router.post('/', async (req, res) => {
    console.log(req.files);
    console.log("here");
    const { error } = validate(req.body);
    if (error) return res.status(400).render('error', {
        error: error.details[0].message
    });
    // Check for existing card in user's decks
    let card = await Card.findOne({ user: req.user.username, deck: req.body.deck, question: req.body.question });
    //if (card) return res.status(400).send('Card with same question already registered in that deck.');
    if (card) return res.status(400).render('error', {
        error: "Card with same question already registered in that deck."
    });
    if (!req.files){
        // Create card and save 
        card = new Card({ 
            deck: req.body.deck.trim(),
            question: req.body.question,
            user: req.user.username,
            answer: req.body.answer,
            tags: req.body.tags
        });
        card = await card.save();
   
        // Check for existing deck, creates new deck if none found
        let deck = await Deck.findOne({ name: card.deck, username: req.user.username });
        if (!deck) {
            deck = new Deck({
                name: card.deck,
                username: req.user.username
            })
            deck = await deck.save();
        }
    }
    else {
        let s3bucket = new AWS.S3({
            accessKeyId: process.env.AWSAccessKeyId, 
            secretAccessKey: process.env.AWSSecretKey,
            region: process.env.region
          });
        
        console.log(req.files.name.data)
    
        var params = {
            Bucket: "flipr",
            Key: req.files.name.name,
            Body: req.files.name.data,
            ContentType: req.files.name.mimetype,
            ACL: "public-read"
        };
        s3bucket.upload(params, async function(err, data) {
            if (err) {
              res.status(500).json({ error: true, Message: err });
            } else {
                // Create card and save 
                card = new Card({ 
                    deck: req.body.deck.trim(),
                    question: req.body.question,
                    user: req.user.username,
                    answer: req.body.answer,
                    questionURL: data.Location,
                    tags: req.body.tags
                });
                card = await card.save();
                console.log(data);
                console.log("card saved");
                // Check for existing deck, creates new deck if none found
                let deck = await Deck.findOne({ name: card.deck, username: req.user.username });
                if (!deck) {
                    deck = new Deck({
                        name: card.deck,
                        username: req.user.username
                    })
                    deck = await deck.save();
                }
              //res.send({ data });
              };
        });
    }
    
    // Reload add card page 
    res.render('addCard', {
        user: req.user.username
    });
});

/*
test PUT request to update card 
*** NOT CURRENTLY IN USE FOR ANYTHING *** 
*/
router.put('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).render('error', {
        error: error.details[0].message
    });
    let card = await Card.findOne({ question: req.body.question });
    if (!card) return res.status(400).send('That card does not exist');
    console.log(req.body.question);

    Card.findOneAndUpdate(req.body.question, { answer: req.body.answer });
    res.send('Product udpated.');
});
    
module.exports = router;