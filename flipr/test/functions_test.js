const {Card} = require('../models/card')
const functions = require('../routes/functions');
const assert = require('assert');
const datetime = require('node-datetime');
let server;

describe('/api/study', () => {
    beforeEach(async () => {
        server = require('../index');
        await Card.collection.insertOne({
            deck: 'test', 
            question: 'test', 
            new: true, 
            difficulty: 2.5, 
            count: 0,
            correctCount: 0, 
            interval: 1,
            due: false,
            dueDate: 20190701,
            current: true
            }
        );
    });
    afterEach(async () => {
        await Card.remove({});
        server.close();
    });

    describe('updateAllDue', () => {
        it('should set due to true if dueDate is before present date', async () => {
            functions.updateAllDue();
            const card = await Card.findOne();
            assert.equal(card.due, true);
        });
    });
});