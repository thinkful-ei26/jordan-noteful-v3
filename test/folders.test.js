'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const { folders } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders API', function(){
    before(function () {
        //connect to mongoose & clean out the DB in case there's any annoying things
        return mongoose.connect(TEST_MONGODB_URI)
          .then(() => mongoose.connection.db.dropDatabase());
      });
    
      beforeEach(function () {
        // run before every test, inserts sample notes (something to test)
        return Folder.insertMany(folders);
      });
    
      afterEach(function () {
          //after each test, clean up the DB (so that one test doesn't affect another)
        return mongoose.connection.db.dropDatabase();
      });
    
      after(function () {
          //disconnect from mongoose after all of the tests
        return mongoose.disconnect();
      });

describe('POST /api/folders', function() {
    it('should create and return a new folder when provided valid data', function() {
        const newFolder = {
            'name': 'NEW AND SHINY FOLDER'
        };

        let res;
        //1) CALL THE API TO INSERT A DOCUMENT
        return chai.request(app)
            .post('/api/folders')
            .send(newFolder)
            .then(function (_res) {
                res = _res;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('id', 'name', 'updatedAt', 'createdAt')
        //2) CALL THE DB
                return Folder.findById(res.body.id);        
            })
        //3) COMPARE API RESPONSE TO DB RESULTS
        .then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.name).to.equal(data.name);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
});

describe('GET /api/folders/:id', function() {
    it('should return correct folder', function() {
        let data;
        //1)CALL THE DB
        return Folder.findOne()
            .then(_data => {
                data = _data;
                //2) CALL THE API WITH THE ID
                return chai.request(app).get(`/api/folders/${data.id}`);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

                //3) COMPARE DB RESULTS TO API RESPONSE
                expect(res.body.id).to.equal(data.id);
                expect(res.body.name).to.equal(data.name);
                expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
            });
    });
});

describe('GET /api/folders', function() {
    it('should return all folders', function() {
    //1) Call the DB **AND** the API
    //2) Wait for both promises to resolve using `Promise.all`
    return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
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

describe('PUT /api/folders/:id', function() {
    it('find folder by ID then update name fields', function() {

    const updatedItem = {
        'name': 'A  BRAND NEW SHINY UPDATED FOLDER'
    };
    let data
      // 1) First, call the database
    chai.request(app)
    .put('/api/folders/:id' + updatedItem.id)
    .send(updatedItem)
    return Folder.findOne()
    .then(_data => {
        data = _data;
        // 2) then call the API with the ID
        return chai.request(app).get(`/api/folders/${data.id}`)
    })
    .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

        // 3) then compare database results to API response
        expect(res.body.id).to.equal(data.id);
        expect(res.body.name).to.equal(data.name);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
    });
    });
});

describe('DELETE /api/folders/:id', function() {
    it('should delete a folder and all contents by id', function() {
        const id = '5c00592e08bcef4ed534daf6'
        let data
          // 1) First, call the database
        chai.request(app)
        .delete('/api/folders/:id' + id.id)
        .send(id)
        return Folder.findOne()
        .then(_data => {
            data = _data;
            // 2) then call the API with the ID
            return chai.request(app).get(`/api/folders/${data.id}`)
        })
        .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
        }); 
        });
    })

});

