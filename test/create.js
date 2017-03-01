require('./root');

const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const assert = require('chai').assert;
const icepop = require('../');
const responses = require('../lib/responses');

const testSchema = new mongoose.Schema({
  title: String,
  content: String,
  noEdit: {
    type: Boolean,
    default: true,
  },
});

const Test = mongoose.model('create_test', testSchema);

const spec = {
  versions: {
    'v1': {
      active: true,
      entities: [
        {
          id: 'test',
          createFields: ['title', 'content'],
          model: Test,
        }
      ]
    }
  },
  security: {
    key: '123',
  }
};

describe('check create method works', function() {
  it ('should create the model', function() {
    const app = icepop(spec);

    return request(app)
      .post(`/v1/test/`)
      .send({key: '123', title: 'hmm', content: 'ahhh'})
      .expect(200)
      .then((res) => {
        assert.isDefined(res.body, 'Recieved response');
        assert.isFalse(res.body.error, 'Did not recieve an error');
        assert.equal(res.body.data.title, 'hmm', 'Titles match');
        assert.equal(res.body.data.content, 'ahhh', 'Content match');
      });
  });

  it ('should not create the model if it gives the wrong data type', function() {
    const app = icepop(spec);

    return request(app)
      .post(`/v1/test/`)
      .send({key: '123', title: {}, content: 'ahhh'})
      .expect(500)
      .then((res) => {
        assert.isDefined(res.body, 'Recieved response');
        assert.isTrue(res.body.error, 'Recieved error');
        assert.include(res.body.message, 'validation failed', 'Got validation message');
      });
  });

  it ('should not save non-specified fields', function() {
    const app = icepop(spec);

    return request(app)
      .post(`/v1/test/`)
      .send({key: '123', title: 'hmm', content: 'ahhh', noEdit: false})
      .expect(200)
      .then((res) => {
        assert.isDefined(res.body, 'Recieved response');
        assert.isFalse(res.body.error, 'Did not recieve an error');
        assert.equal(res.body.data.noEdit, true, 'Field did not change');
      });
  });

  it ('should not create a model if its missing fields', function() {
    const app = icepop(spec);

    return request(app)
      .post(`/v1/test/`)
      .send({key: '123', title: 'hmm'})
      .expect(responses.missingData.status)
      .then((res) => {
        assert.isDefined(res.body, 'Recieved response');
        assert.deepEqual(res.body, responses.missingData.res, 'Correct error returned');
      });
  });

  it ('should not create the model without a key', function() {
    const app = icepop(spec);

    return request(app)
      .post(`/v1/test/`)
      .send({title: 'hmm', content: 'ahhh'})
      .expect(responses.notAuthorized.status)
      .then((res) => {
        assert.isDefined(res.body, 'Recieved response');
        assert.deepEqual(res.body, responses.notAuthorized.res, 'Correct error returned');
      });
  });
});
