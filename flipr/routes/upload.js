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
    res.render('upload',{
        user: req.user.username
    });
});

router.post('/', async (req, res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    console.log(req.files);
    const fileStream = fs.createReadStream(req.files.name.name);
    const parser = csv.parse();
    let cardCount = 0;

    let rows = []
    fileStream
        .pipe(parser)
        .on('error', error => console.error(error))
        .on('readable', async () => {
            // create array from rows of csv file 
            for (let row = parser.read(); row; row = parser.read()) {
                    console.log(row);
                    rows.push(row);
                }
        })
        .on('end', async (rowCount) => {
            cardCount = rowCount;
            console.log(`Parsed ${rowCount} rows`);
            console.log(cardCount);
            console.log(rows);
            // iterate through array of rows from csv file and create card from each 
            for (let i in rows){
                //Check for existing deck, creates new deck if none found
                let deck = await Deck.findOne({ name: rows[i][0].trim(), username: req.user.username });
                console.log("HERE", deck);
                if (deck === null) {
                    deck = new Deck({
                        name: rows[i][0].trim(),
                        username: req.user.username
                    })
                    deck = await deck.save();
                }
                // Create card and save 
                try{
                    card = new Card({ 
                        deck: rows[i][0].trim(),
                        question: rows[i][1].trim(),
                        user: req.user.username,
                        answer: rows[i][2].trim(),
                    });
                    card = await card.save();
                } catch(err){
                    console.log(err);
                }
                console.log("card", card);
            }
            res.render('uploadSuccess', {
                cards: cardCount,
                user: req.user.username
        })});
});
    
module.exports = router;