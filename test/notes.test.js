'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes API', function(){
    before(function () {
        //connect to mongoose & clean out the DB in case there's any annoying things
        return mongoose.connect(TEST_MONGODB_URI)
          .then(() => mongoose.connection.db.dropDatabase());
      });
    
      beforeEach(function () {
        // run before every test, inserts sample notes (something to test)
        return Note.insertMany(notes);
      });
    
      afterEach(function () {
          //after each test, clean up the DB (so that one test doesn't affect another)
        return mongoose.connection.db.dropDatabase();
      });
    
      after(function () {
          //disconnect from mongoose after all of the tests
        return mongoose.disconnect();
      });

describe('POST /api/notes', function() {
    it('should create and return a new item when provided valid data', function() {
        const newItem = {
            'title': 'The best article about cats ever!',
            'content': '...Lorem ipsum...'
        };

        let res;
        //1) CALL THE API TO INSERT A DOCUMENT
        return chai.request(app)
            .post('/api/notes')
            .send(newItem)
            .then(function (_res) {
                res = _res;
                expect(res).to.have.status(201);
                expect(res).to.have.header('location');
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt')
        //2) CALL THE DB
                return Note.findById(res.body.id);        
            })
        //3) COMPARE API RESPONSE TO DB RESULTS
        .then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.title).to.equal(data.title);
            expect(res.body.content).to.equal(data.content);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
});

describe('GET /api/notes/:id', function() {
    it('should return correct note', function() {
        let data;
        //1)CALL THE DB
        return Note.findOne()
            .then(_data => {
                data = _data;
                //2) CALL THE API WITH THE ID
                return chai.request(app).get(`/api/notes/${data.id}`);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

                //3) COMPARE DB RESULTS TO API RESPONSE
                expect(res.body.id).to.equal(data.id);
                expect(res.body.title).to.equal(data.title);
                expect(res.body.content).to.equal(data.content);
                expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
            });
    });
});

describe('GET /api/notes', function() {
    it('should return all notes', function() {
    //1) Call the DB **AND** the API
    //2) Wait for both promises to resolve using `Promise.all`
    return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
    ])
    //3) Compare DB results to API response
        .then(([data, res]) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length(data.length);
        });
    }) 
});

describe('PUT /api/notes/:id', function() {
    it('find item by ID then update title and content fields', function() {

    const updatedItem = {
        'title': 'I HAVE BEEN UPDATED!!!!!!',
        'content': '...Lorem ipsum...'
    };
    let data
      // 1) First, call the database
    chai.request(app)
    .put('/api/notes/:id' + updatedItem.id)
    .send(updatedItem)
    return Note.findOne()
    .then(_data => {
        data = _data;
        // 2) then call the API with the ID
        return chai.request(app).get(`/api/notes/${data.id}`)
    })
    .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

        // 3) then compare database results to API response
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
    });
    });
});

describe('DELETE /api/notes/:id', function() {
    it('should delete an item by id', function() {
        const id = '000000000000000000000003'
        let data
          // 1) First, call the database
        chai.request(app)
        .delete('/api/notes/:id' + id.id)
        .send(id)
        return Note.findOne()
        .then(_data => {
            data = _data;
            // 2) then call the API with the ID
            return chai.request(app).get(`/api/notes/${data.id}`)
        })
        .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
    
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
    
            // 3) then compare database results to API response
            expect(res.body.id).to.equal(data.id);
            expect(res.body.title).to.equal(data.title);
            expect(res.body.content).to.equal(data.content);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
        });
    })
});

  