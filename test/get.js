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

const Test = mongoose.model('Get', testSchema);

const populationTestSchema = new mongoose.Schema({
  thing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Get',
  }
});

const Population = mongoose.model('PopulationGet', populationTestSchema);

const spec = {
  versions: {
    'v1': {
      entities: [
        {
          id: 'test',
          getBy: ['_id'],
          model: Test,
        },
        {
          id: 'populate',
          getBy: ['_id'],
          populate: {
            path: 'thing',
            model: 'Get',
          },
          model: Population,
        }
      ]
    }
  }
};

describe('check get method works', function() {
  it ('should get the model by _id', function() {
    const app = icepop(spec);
    const title = 'yes';

    return new Test({ title }).save()
    .then((test) => {
      return request(app)
        .get(`/v1/test/_id/${test._id}`)
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.equal(res.body.data.title, title, 'Titles match');
        });
    });
  });

  it ('should not get the model by title', function() {
    const app = icepop(spec);

    return new Test({ title: 'fdsfs' }).save()
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
    const app = icepop(spec);

    return new Test({ title: 'fdsfds' }).save()
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
    const app = icepop(spec);

    return new Test({ title: 'fdsfds' }).save()
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

describe('verify get population works', function() {
  it ('should populate the model', function() {
    const app = icepop(spec);
    const title = 'the title';

    return new Test({ title }).save()
    .then((t) => {
      const populate = new Population({
        thing: t._id,
      });

      return populate.save();
    })
    .then((p) => {
      return request(app)
        .get(`/v1/populate/_id/${p._id}`)
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.isObject(res.body.data.thing, 'Embedd was populated');
          assert.equal(res.body.data.thing.title, title, 'Titles match');
        });
    });
  });
});
