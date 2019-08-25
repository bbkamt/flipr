const datetime = require('node-datetime');

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
        card.interval = 4;
    }
    else {
        if (card.correctCount === 0){
            card.interval = (card.count-1) * (card.difficulty);
        }
        else{
            card.interval = (card.count-1) * (card.difficulty * card.correctCount);
        }
        
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

module.exports.setDifficulty = setDifficulty;
module.exports.setInterval = setInterval;
module.exports.setDueDate = setDueDate;
module.exports.setCorrectCount = setCorrectCount;
module.exports.setCount = setCount;
module.exports.setNew = setNew;
module.exports.setDue = setDue;
module.exports.setCurrent = setCurrent;