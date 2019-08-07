const {Card} = require('../models/card')
const request = require('supertest');
const functions = require('../routes/functions');
const assert = require('assert');
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
            due: true,
            current: false
            }
        );
    });
    afterEach(async () => {
        
        server.close();
    });

    describe('setInterval', () => {
        it('should set interval to 1 if count is 0', async () => {
            const card = await Card.findOne({ due: true });
            console.log(card.interval);
            const result = functions.setInterval(card);
            console.log(card.interval);
            assert.equal(card.interval, 1);
        });
    });
});