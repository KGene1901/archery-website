/* eslint-disable no-undef */
'use strict';

const request = require('supertest');
const app = require('./app');
// eslint-disable-next-line no-unused-vars
const superagent = require('superagent');
console.log('ESLint pretest successful');

// if jest test fails, delete one of the "only" statement and add it back in and rerun the test

describe.only('Test scoring service', () => {

    beforeEach(() => {
        jest.setTimeout(10000);
      });

    test('GET /scoreData succeeds and returns JSON', () => {
        return request(app)
        .get('/scoreData')
        .expect(200)
        .expect('Content-type', /json/);
    });

    test('POST /newScoreData new score information to be accessed via GET succeeds', async () => {
        const params2 = {Name: "Joshua", Bow: "Barebow", InOut: "Outdoor", Score: 230}
        try{
            await request(app)
                .post('/newScoreData')
                .send(params2)
                .expect(200);
        }catch(e){
            console.error(e);
        }

        return request(app)
            .get('/scoreData')
            .expect(200)
            .expect('Content-type', /json/);

    });

});


describe.only('Test image service', () => {
    test('GET /imgdir succeeds and returns JSON', () => {
        return request(app)
        .get('/imgdir')
        .expect(200)
        .expect('Content-type', /json/);
    });


    test('POST /imgUpload new image with description', async () => {
            await request(app)
                .post('/imgUpload')
                .attach('document', 'test_pic.jpg')
                .field('title', 'A good shot')
                .field('description', 'First time hitting all gold')
                .field('optradio', 'training')
                .expect(200);

            return request(app)
                .get('/imgdir')
                .expect(200)
                .expect('Content-type', /json/);
    });

});


describe.only('Test events service', () => {
    test('GET /search with empty keyword with time and location set to null succeeds and returns JSON', () => {
        return request(app)
        .get('/search?keyword=&time=null&loc=null')
        .expect(200)
        .expect('Content-type', /json/);
    });

    test('GET /search with empty keyword with time set to upc and location set to loc succeeds and returns correct JSON information', () => {
        return request(app)
        .get('/search?keyword=&time=upc&loc=loc')
        .expect(200)
        .expect('Content-type', /json/)
        .expect([{"title":"Junior Outdoor Championships", "date":"04/07/2020", "location":"Lilleshall National Sports Centre", "country":"UK", "url":"TBC"},
        {"title":"British Target Championships", "date":"08/08/2020", "location":"TBC", "country":"UK", "url":"https://www.archerygb.org/shoot-compete/compete/archery-gb-competitions/british-target-championships/"},
        {"title":"Youth Festival", "date":"27/07/2020", "location":"Lilleshall National Sports Centre", "country":"UK", "url":"https://www.archerygb.org/shoot-compete/compete/archery-gb-youth-competitions/youth-festival/"}
        ]);
    });

    test('GET /search with starting letter (a) with time and location set to null succeeds and returns JSON', () => {
        return request(app)
        .get('/search?keyword=a&time=null&loc=null')
        .expect(200)
        .expect('Content-type', /json/);
    });

    test('GET /search with a word with time and location set to null succeeds and returns correct JSON information', () => {
        return request(app)
        .get('/search?keyword=BUCS&time=null&loc=null')
        .expect(200)
        .expect('Content-type', /json/)
        .expect([{"title":"BUCS Regional Northern Indoor Qualifiers", "date":"22/02/2020", "location":"Edinburgh Napier University", "country":"UK", "url":"https://www.bucs.org.uk/events-page/bucs-archery-indoor-regional-qualifiers.html"}, 
                    {"title":"BUCS Regional Southern Indoor Qualifiers", "date":"22/02/2020", "location":"Bristol University",  "country":"UK", "url":"https://www.bucs.org.uk/events-page/bucs-archery-indoor-regional-qualifiers.html"}, 
                    {"title":"BUCS Regional Central Indoor Qualifiers", "date":"15/02/2020", "location":"Manchester Met University",  "country":"UK", "url":"https://www.bucs.org.uk/events-page/bucs-archery-indoor-regional-qualifiers.html"},
                ]);
    });

    test('GET /search with a word with time set to past and location set to local returns with correct information', () => {
        return request(app)
        .get('/search?keyword=BUCS&time=past&loc=loc')
        .expect([{"title":"BUCS Regional Northern Indoor Qualifiers", "date":"22/02/2020", "location":"Edinburgh Napier University", "country":"UK", "url":"https://www.bucs.org.uk/events-page/bucs-archery-indoor-regional-qualifiers.html"}, 
                    {"title":"BUCS Regional Southern Indoor Qualifiers", "date":"22/02/2020", "location":"Bristol University",  "country":"UK", "url":"https://www.bucs.org.uk/events-page/bucs-archery-indoor-regional-qualifiers.html"}, 
                    {"title":"BUCS Regional Central Indoor Qualifiers", "date":"15/02/2020", "location":"Manchester Met University",  "country":"UK", "url":"https://www.bucs.org.uk/events-page/bucs-archery-indoor-regional-qualifiers.html"},
                ])
    });

    test('GET /search with a word with time set to upc and location set to local succeeds and returns with correct information', () => {
        return request(app)
        .get('/search?keyword=BUCS&time=upc&loc=loc')
        .expect(200)
        .expect({});
    });

    test('GET /search with starting letter (z) with time and location set to null succeeds and returns error text', () => {
        return request(app)
        .get('/search?keyword=z&time=null&loc=null')
        .expect(200)
        .expect('No events found with given input. Please try again.');
    });

    test('GET /search with non-letter symbol with time and location set to null succeeds and returns error text', () => {
        return request(app)
        .get('/search?keyword=$&time=null&loc=null')
        .expect(200)
        .expect('No events found with given input. Please try again.');
    });

    test('GET /search with non-letter symbol with time set to upc and location set to int returns error text', () => {
        return request(app)
        .get('/search?keyword=$&time=upc&loc=int')
        .expect('No events found with given input. Please try again.')
    });

});


describe.only('Test query service', () => {

    test('GET /customerquery succeeds and returns JSON', () => {
        return request(app)
        .get('/customerquery')
        .expect(200)
        .expect('Content-type', /json/)

    });

    test('POST /newUserQuery new query with empty string values return error message', async () => {
        const invalidParam = {name: "", email: "    ", subject: "Finding training buddies", msg: "Hello"}
        try{
            await request(app)
            .post('/newUserQuery')
            .send(invalidParam)
            .expect(200)
            .expect('Error: Missing required field info');
           
        }catch(e){
            console.error(e);
        }
        
    });

    test('POST /newUserQuery new questions to be accessed via GET request succeeds', () => {
        const params4 = {name: "Steve", email: "archersteve@gmail.com", subject: "Finding training buddies", msg: "Any fellow Newcastle archers wanna come and train with me this weekend? Let me know"}
        try{
            return request(app)
            .post('/newUserQuery')
            .send(params4)
            .expect(200)

        }catch(e){
            console.error(e);
        }

        return request(app)
            .get('/customerquery')
            .expect(200)
            .expect('Content-type', /json/);
        
    });

});