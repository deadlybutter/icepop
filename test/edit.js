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

const Test = mongoose.model('edit_test', testSchema);

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
          edit: {
            by: ['_id'],
            fields: ['title', 'content'],
          },
          model: Test,
        }
      ]
    }
  },
  security: {
    key: '123',
  }
};

describe('check edit method works', function() {
  it ('should edit the model by _id and change title', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .put(`/v1/test/_id/${test._id}`)
        .send({key: '123', title: 'hmm'})
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.equal(res.body.data.title, 'hmm', 'Titles match');
        });
    });
  });

  it ('should not edit the model by title', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .put('/v1/test/title/sdfdsfds')
        .send({key: '123'})
        .expect(responses.invalidField.status)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.deepEqual(res.body, responses.invalidField.res, 'Correct error returned');
        });
    });
  });

  it ('should not edit the model if it gives the wrong data type', function() {
    const app = icepop(spec);
    const t = new Test({
      title: 'test',
      content: 'content',
    });

    return t.save()
    .then(() => {
      return request(app)
        .put(`/v1/test/_id/${t._id}`)
        .send({key: '123', title: {}})
        .expect(500)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isTrue(res.body.error, 'Recieved error');
          assert.include(res.body.message, 'validation failed', 'Got validation message');
        });
    });
  });

  it ('should not edit the model for un-specified types', function() {
    const app = icepop(spec);
    const t = new Test({
      title: 'test',
      content: 'content',
    });

    return t.save()
    .then(() => {
      return request(app)
        .put(`/v1/test/_id/${t._id}`)
        .send({key: '123', noEdit: false})
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.equal(res.body.data.noEdit, true, 'Field did not change');
        });
    });
  });

  it ('should not edit the model without a key', function() {
    const app = icepop(spec);

    return test.save()
    .then(() => {
      return request(app)
        .put(`/v1/test/_id/${test._id}`)
        .send({title: 'hmm'})
        .expect(responses.notAuthorized.status)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.deepEqual(res.body, responses.notAuthorized.res, 'Correct error returned');
        });
    });
  });
});
