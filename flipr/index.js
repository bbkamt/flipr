const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const setUpPassport = require('./setuppassport');

const cards = require('./routes/cards');
const decks = require('./routes/decks');
const study = require('./routes/study');
const users = require('./routes/users');
const multiReview = require('./routes/multiReview');
const multipleChoice = require('./routes/multipleChoice');
const upload = require('./routes/upload');
const config = require('config');

const app = express();
const db = config.get('db');

mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log(`Connected to ${db}...`))
    .catch(err => console.error('Could not connect to MongoDB...'));

setUpPassport();

// Get rid of deprecation warnings from mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('view engine', 'pug');
app.use(express.json());
// User bodyParser to get data from html form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX", 
    resave: true, 
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/cards', cards);
app.use('/api/decks', decks);
app.use('/api/study', study);
app.use('/api/signup', users);
app.use('/api/multireview', multiReview);
app.use('/api/multipleChoice', multipleChoice);
app.use('/api/upload', upload);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('welcome');
})

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server; 