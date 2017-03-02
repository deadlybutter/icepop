require('./root');

const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const assert = require('chai').assert;
const icepop = require('../');
const responses = require('../lib/responses');

const testSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  content: String,
});

const Test = mongoose.model('Query', testSchema);

const populationTestSchema = new mongoose.Schema({
  thing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query',
  }
});

const Population = mongoose.model('PopulationQuery', populationTestSchema);

const spec = {
  versions: {
    'v1': {
      entities: [
        {
          id: 'test',
          queryBy: ['_id', 'title'],
          model: Test,
        },
        {
          id: 'populate',
          queryBy: ['_id'],
          populate: ['thing'],
          model: Population,
        }
      ]
    }
  }
};

describe('check query method works', function() {
  it ('should query the model by _id', function() {
    const app = icepop(spec);
    const title = 'yes';

    return new Test({ title }).save()
    .then((test) => {
      return request(app)
        .get(`/v1/test?_id=${test._id}`)
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.isArray(res.body.data, 'Recieved an array');
          assert.equal(res.body.data[0].title, title, 'Titles match');
        });
    });
  });

  it ('should return multiple matching items', function() {
    const app = icepop(spec);

    const test1 = new Test({
      title: 'a',
    });
    const test2 = new Test({
      title: 'a'
    });
    const test3 = new Test({
      title: 'b'
    });

    return test1.save().then(() => test2.save()).then(() => test3.save()).then(() => {
      return request(app)
        .get('/v1/test?title=a')
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.isArray(res.body.data, 'Recieved an array');
          assert.equal(res.body.data.length, 2, 'Recieved 2 items');
        });
    });
  });

  it ('should not return anything for subtitle query', function() {
    const app = icepop(spec);

    return new Test({ title: 'uh' }).save()
    .then(() => new Test({ title: 'uh', subtitle: 'ipsum' }).save())
    .then(() => {
      return request(app)
        .get('/v1/test?subtitle=ipsum')
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.lengthOf(res.body.data, 2, 'Recieved 2 items');
        });
    });
  });

  it ('should throw an error for a fake ID', function() {
    const app = icepop(spec);

    return new Test({ title: 'uh' }).save()
    .then(() => {
      return request(app)
        .get('/v1/test?_id=fdsfds')
        .expect(500)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isTrue(res.body.error, 'Recieved error');
          assert.isDefined(res.body.message, 'Recieved error message');
        });
    });
  });
});

describe('verify pagination works', function() {
  it ('should paginate through multiple items', function() {
    const app = icepop(spec);

    const models = [];

    for (let i = 0; i < 65; i++) {
      models.push(new Test({
        title: i % 2 ? 'a' : 'b',
      }));
    }

    return Test.create(models)
      .then(() => {
        return request(app)
          .get('/v1/test?title=a')
          .expect(200)
          .then((res) => {
            assert.isDefined(res.body, 'Recieved response');
            assert.equal(res.body.pagination.page, 1, 'Recieved page 1');
            assert.equal(res.body.pagination.count, 25, 'Recieved 25 count');
            assert.lengthOf(res.body.data, 25, 'Recieved 25 items');
          });
      })
      .then(() => {
        return request(app)
          .get('/v1/test?title=a&page=2')
          .expect(200)
          .then((res) => {
            assert.isDefined(res.body, 'Recieved response');
            assert.equal(res.body.pagination.page, 2, 'Recieved page 2');
            assert.equal(res.body.pagination.count, 7, 'Recieved 7 count');
            assert.lengthOf(res.body.data, 7, 'Recieved 7 items');
          });
      });
  });
});

describe('verify query population works', function() {
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
        .get(`/v1/populate?_id=${p._id}`)
        .expect(200)
        .then((res) => {
          assert.isDefined(res.body, 'Recieved response');
          assert.isFalse(res.body.error, 'Did not recieve an error');
          assert.isObject(res.body.data[0].thing, 'Embedd was populated');
          assert.equal(res.body.data[0].thing.title, title, 'Titles match');
        });
    });
  });
});
