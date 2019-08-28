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
            current: true
            }
        );
    });
    afterEach(async () => {
        await Card.remove({});
        server.close();
    });

    describe('setInterval', () => {
        it('should set interval to 1 if count is 0', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setInterval(card);
            assert.equal(card.interval, 1);
        });
        it('should set interval to 1 if count is 1', async () => {
            await Card.collection.insertOne({
                deck: 'test', 
                question: 'setIntervalTest', 
                new: true, 
                difficulty: 2.5, 
                count: 1,
                correctCount: 0, 
                interval: 1,
                due: true,
                current: false
                }
            );
            const card = await Card.findOne({ count: 1 });
            const result = functions.setInterval(card);
            assert.equal(card.interval, 4);
        });
        it('should set interval to 1 if count is 1', async () => {
            await Card.collection.insertOne({
                deck: 'test', 
                question: 'setIntervalTest2', 
                new: true, 
                difficulty: 2.5, 
                count: 2,
                correctCount: 1, 
                interval: 1,
                due: true,
                current: false
                }
            );
            const card = await Card.findOne({ count: 2 });
            const result = functions.setInterval(card);
            assert.equal(card.interval, 2.5);
        });


    });
    
    describe('setCorrectCount', () => {
        it('should increment correctCount by 1 if rating is not 0', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setCorrectCount(card, 1);
            assert.equal(card.correctCount, 1);
        });
        it('should reset count to 0 if rating is 0', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setCorrectCount(card, 0);
            assert.equal(card.correctCount, 0);
        });
    });

    describe('setCount', () => {
        it('should increment count by 1', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setCount(card);
            assert.equal(card.count, 1);
        });
    });

    describe('setNew', () => {
        it('should set new to false if new is true', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setNew(card);
            assert.equal(card.new, false);
        });
    });

    describe('setDue', () => {
        it('should set due to false if rating is greater than 0', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setDue(card, 1);
            assert.equal(card.due, false);
        });
        it('should set due to true if rating is 0', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setDue(card, 0);
            assert.equal(card.due, true);
        });
    });

    describe('setCurrent', () => {
        it('should set current flag to false', async () => {
            const card = await Card.findOne({ due: true });
            const result = functions.setCurrent(card);
            assert.equal(card.current, false);
        });
    });
});