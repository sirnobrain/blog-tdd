'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const jwt = require('jsonwebtoken');

const app = require('./../app');
const models = require('./../models');

chai.use(chaiHttp);

describe('Delete a Post API: DELETE /post', (done) => {
	/*
	Declare variable jwtoken for testing
	*/
	let jwtoken = null;
	let falseJwtoken = jwt.sign({ foo: 'bar' }, 'falsestoken');

	/*
	Declare variable postId
	*/
	let validPostId = null;
	let falsePostId = require('mongoose').Types.ObjectId();

	/*
	fake post
	*/
	const fakePost = {
		title: 'This Is A Post',
		text: 'This is post content',
		featured_image_url: 'https://www.codeproject.com/KB/GDI-plus/ImageProcessing2/flip.jpg'
	}

	/*
	Before all tests, signup/create user to get jwtoken for testing
	*/
	before(done => {
		chai.request(app)
		.post('/signup')
		.send({
			username: 'user',
			password: 'user'
		})
		.end((err, response) => {
			jwtoken = response.body.payload.jwtoken;
			done();
		});
	});

	/*
	After all tests, clear user database
	*/
	after(done => {
		models.User.remove({}, (err) => {
			done();
		});
	});

	/*
	Before each test, create a post for testing
	*/
	beforeEach(done => {
		chai.request(app)
		.set('jwtoken', jwtoken)
		.post('/post')
		.send(fakePost)
		.end((err, response) => {
			validPostId = response.body.payload._id;

			done();
		});
	});

	/*
	After each test, clear post database
	*/
	after(done => {
		models.Post.remove({}, (err) => {
			done();
		});
	});

	/*
	Test DELETE /post response object
	*/
	it('should generate a generic application response {status, message, payload, err}', (done) => {
		chai.request(app)
		.delete('/post')
		.set('jwtoken', jwtoken)
		.send(validPostId)
		.end((err, response) => {
			const appResponse = response.body;

			should.exist(appResponse);

			appResponse.should.be.an('object');
			appResponse.should.have.property('status');
			appResponse.should.have.property('message');
			appResponse.should.have.property('payload');
			appResponse.should.have.property('err');

			appResponse.status.should.be.a('number');
			appResponse.message.should.be.a('string');
			appResponse.payload.should.be.an('object');
			should.not.exist(appResponse.err);

			done();
		});
	});

	/*
	Test DELETE /post response payload with valid token and post id
	*/
	it('should contain an object representing number of updated content if token is valid and post id is valid', (done) => {
		chai.request(app)
		.delete('/post')
		.set('jwtoken', jwtoken)
		.send(validPostId)
		.end((err, response) => {
			const appResponse = response.body;

			response.status.should.equal(200);

			appResponse.status.should.equal(200);
			appResponse.message.should.be.a('string');
			appResponse.payload.should.be.an('object');
			should.not.exist(appResponse.err);

			done();
		});
	});

	/*
	Test DELETE /post response payload with missing post id
	*/
	it('should return a 406 error if post id is missing', (done) => {
		chai.request(app)
		.delete('/post')
		.set('jwtoken', jwtoken)
		.send({})
		.end((err, response) => {
			const appResponse = response.body;

			response.status.should.equal(406);

			appResponse.status.should.equal(406);
			appResponse.message.should.be.a('string');
			should.not.exist(appResponse.payload);
			should.exist(appResponse.err);

			done();
		});
	});

	/*
	Test DELETE /post response payload with invalid post id
	*/
	it('should return a 404 error if post id is missing', (done) => {
		chai.request(app)
		.delete('/post')
		.set('jwtoken', jwtoken)
		.send(falsePostId)
		.end((err, response) => {
			const appResponse = response.body;

			response.status.should.equal(404);

			appResponse.status.should.equal(404);
			appResponse.message.should.be.a('string');
			should.not.exist(appResponse.payload);
			should.exist(appResponse.err);

			done();
		});
	});

	/*
	Test DELETE$ /post response payload with missing token
	*/
	it('should return a 401 error if jwtoken is missing', (done) => {
		chai.request(app)
		.delete('/post')
		.send(validPostId)
		.end((err, response) => {
			const appResponse = response.body;

			response.status.should.equal(401);

			appResponse.status.should.equal(401);
			appResponse.message.should.be.a('string');
			should.not.exist(appResponse.payload);
			should.exist(appResponse.err);

			done();
		});
	});

	/*
	Test DELETE /post response payload with invalid token
	*/
	it('should return a 403 error if jwtoken is invalid', (done) => {
		chai.request(app)
		.delete('/post')
		.set('jwtoken', falseJwtoken)
		.send(validPostId)
		.end((err, response) => {
			const appResponse = response.body;

			response.status.should.equal(403);

			appResponse.status.should.equal(403);
			appResponse.message.should.be.a('string');
			should.not.exist(appResponse.payload);
			should.exist(appResponse.err);

			done();
		});
	});
});