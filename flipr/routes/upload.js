const {Card, validate} = require('../models/card');
const {Deck, deckValidate} = require('../models/deck');
const ensureAuthenticated = require('./users');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const csv = require('fast-csv');
const fs = require('fs'); 
const fileUpload = require('express-fileupload');


// User bodyParser to get data from html form
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/*Middleware to authenticate the user for each GET/POST request */
const ensureAuth = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.flash("info", "You must be logged in to see this page.");
        res.redirect("/");
    }
};
router.use(ensureAuth);
router.use(fileUpload());

router.get('/', (req, res) => {
    res.render('upload');
});

router.post('/', async (req, res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    console.log(req.files);
    const fileStream = fs.createReadStream(req.files.name.name);
    const parser = csv.parse();
    let cardCount = 0;

    fileStream
        .pipe(parser)
        .on('error', error => console.error(error))
        .on('readable', async () => {
        for (let row = parser.read(); row; row = parser.read()) {
                console.log(row);
                // Create card and save 
                try{
                    card = new Card({ 
                        deck: row[0].trim(),
                        question: row[1],
                        user: req.user.username,
                        answer: row[2],
                    });
                    card = await card.save();
                } catch(err){
                    console.log(err);
                }
                
            
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
        })
        .on('end', (rowCount) => {
            cardCount = rowCount;
            console.log(`Parsed ${rowCount} rows`);
            console.log(cardCount);
            res.render('uploadSuccess', {
                cards: cardCount
        })});
});
    
module.exports = router;