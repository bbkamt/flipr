const cards = require('./routes/cards');
const {Card, validate} = require('./models/card');
const decks = require('./routes/decks');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://localhost/mempro')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'));

app.set('view engine', 'pug');
app.use(express.json());

app.use('/api/cards', cards);
app.use('/api/decks', decks);
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'MemPro'
    });
})

app.get('/api/deck', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let card = await Card.find({ question: "hello" });
    if (!card) return res.status(400).send('Card not found.');

    res.send(card);

   })

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
