require('./root');

const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const assert = require('chai').assert;
const icepop = require('../');
const responses = require('../lib/responses');

const testSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Test = mongoose.model('get_test', testSchema);

const test = new Test({
  title: 'Lorem',
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
});

const spec = {
  versions: {
    'v1': {
      active: true,
      entities: [
        {
          id: 'test',
          getBy: ['_id'],
          model: Test,
        }
      ]
    }
  }
};

const app = icepop(spec);

describe('check get method works', function() {
  it ('should get the model by _id', function() {
    return test.save()
    .then(() => {
      return request(app)
        .get(`/v1/test/_id/${test._id}`)
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.equal(res.body.data.title, test.title, 'Titles match');
        });
    });
  });

  it ('should not get the model by title', function() {
    return test.save()
    .then(() => {
      return request(app)
        .get('/v1/test/title/sdfdsfds')
        .expect(responses.invalidField.status)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.deepEqual(res.body, responses.invalidField.res, 'Correct error returned');
        });
    });
  });

  it ('should throw an error for a fake ID', function() {
    return test.save()
    .then(() => {
      return request(app)
        .get('/v1/test/_id/sdfdsfds')
        .expect(500)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isTrue(res.body.error, 'Recieved error');
          assert.isDefined(res.body.message, 'Recieved error message');
        });
    });
  });

  it ('should throw an error for a non existent ID', function() {
    return test.save()
    .then(() => {
      return request(app)
        .get('/v1/test/_id/58b2370de956920cb856393c')
        .expect(responses.entityNotFound.status)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.deepEqual(res.body, responses.entityNotFound.res, 'Correct error returned');
        });
    });
  });
});
