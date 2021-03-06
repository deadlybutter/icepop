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

const Test = mongoose.model('delete_test', testSchema);

const test = new Test({
  title: 'Lorem',
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
});

const spec = {
  versions: {
    'v1': {
      entities: [
        {
          id: 'test',
          deleteBy: ['_id'],
          model: Test,
        }
      ]
    }
  },
  security: {
    key: '123',
  }
};

describe('check delete method works', function() {
  it ('should delete the model by _id', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .delete(`/v1/test/_id/${test._id}`)
        .send({key: '123'})
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.isTrue(res.body.deleted, true);
        });
    });
  });

  it ('should not delete the model by title', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .delete('/v1/test/title/fdsd')
        .send({key: '123'})
        .expect(responses.invalidField.status)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.deepEqual(res.body, responses.invalidField.res, 'Correct error returned');
        });
    });
  });

  it ('should throw an error for a fake ID', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .delete('/v1/test/_id/sdfdsfds')
        .send({key: '123'})
        .expect(500)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isTrue(res.body.error, 'Recieved error');
          assert.isDefined(res.body.message, 'Recieved error message');
        });
    });
  });

  it ('should throw an error for a non existent ID', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .delete('/v1/test/_id/58b2370de956920cb856393c')
        .send({key: '123'})
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.deleted, 'Did not delete');
        });
    });
  });

  it ('should not delete the model without a key', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .delete('/v1/test/title/fdsd')
        .expect(responses.notAuthorized.status)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.deepEqual(res.body, responses.notAuthorized.res, 'Correct error returned');
        });
    });
  });
});
