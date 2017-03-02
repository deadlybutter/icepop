// require('./root');
//
// const mongoose = require('mongoose');
// const request = require('supertest-as-promised');
// const assert = require('chai').assert;
// const icepop = require('../');
// const responses = require('../lib/responses');
//
// const testSchema = new mongoose.Schema({
//   title: String,
//   content: String,
// });
//
// const Test = mongoose.model('Deprecated', testSchema);
//
// const spec = {
//   versions: {
//     'v1': {
//       entities: [
//         {
//           id: 'test',
//           getBy: ['_id'],
//           // deprecated: true,
//           model: Test,
//         },
//       ]
//     }
//   }
// };
//
// describe('check deprecated methods work', function() {
//   it ('should not get the model by _id', function() {
//     const app = icepop(spec);
//     const title = 'yes';
//
//     return new Test({ title }).save()
//     .then((test) => {
//       return request(app)
//         .get(`/v1/test/_id/${test._id}`)
//         .expect(responses.deprecated.status)
//         .then((res) => {
//           assert.isDefined(res.body, 'Recieved response');
//           assert.deepEqual(res.body, responses.deprecated.res, 'Correct error returned');
//         });
//     });
//   });
//
//   it ('should not allow put method through', function() {
//     const app = icepop(spec);
//
//     return request(app)
//       .put('/v1/test/')
//       .expect(responses.deprecated.status)
//       .then((res) => {
//         assert.isDefined(res.body, 'Recieved response');
//         assert.deepEqual(res.body, responses.deprecated.res, 'Correct error returned');
//       });
//   });
//
//   it ('should not allow post method through', function() {
//     const app = icepop(spec);
//
//     return request(app)
//       .post('/v1/test/')
//       .expect(responses.deprecated.status)
//       .then((res) => {
//         assert.isDefined(res.body, 'Recieved response');
//         assert.deepEqual(res.body, responses.deprecated.res, 'Correct error returned');
//       });
//   });
//
//   it ('should not allow delete method through', function() {
//     const app = icepop(spec);
//
//     return request(app)
//       .delete('/v1/test/')
//       .expect(responses.deprecated.status)
//       .then((res) => {
//         assert.isDefined(res.body, 'Recieved response');
//         assert.deepEqual(res.body, responses.deprecated.res, 'Correct error returned');
//       });
//   });
//
//   it ('should not allow query method through', function() {
//     const app = icepop(spec);
//
//     return request(app)
//       .get('/v1/test/')
//       .expect(responses.deprecated.status)
//       .then((res) => {
//         assert.isDefined(res.body, 'Recieved response');
//         assert.deepEqual(res.body, responses.deprecated.res, 'Correct error returned');
//       });
//   });
// });
